import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, 'src', 'app');
const docsDir = path.join(repoRoot, 'docs');
const outJson = path.join(docsDir, 'route-ui-audit-data.json');
const outMd = path.join(docsDir, 'ROUTE_UI_AUDIT_REPORT.md');

const ROUTE_FILE_RE = /(^|\\)(page|not-found)\.(tsx|jsx|ts|js)$/;
const ROUTE_HANDLER_FILE_RE = /(^|\\)route\.(tsx|jsx|ts|js)$/;
const COMPONENT_FILE_RE = /\.(tsx|jsx|ts|js)$/;
const TAB_KEYWORDS = [
  'Tabs',
  'TabsList',
  'TabsTrigger',
  'TabsContent',
  'NewsCategoryTabs',
  'SettingsSidebar',
  'settingsTabs',
  'tab='
];

function posix(p) {
  return p.split(path.sep).join('/');
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

function resolveImport(fromFile, spec) {
  let base = null;
  if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else if (spec.startsWith('@/')) {
    base = path.join(repoRoot, 'src', spec.slice(2));
  }

  if (!base) return null;

  const candidates = [
    base,
    `${base}.tsx`, `${base}.jsx`, `${base}.ts`, `${base}.js`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.jsx'),
    path.join(base, 'index.ts'),
    path.join(base, 'index.js')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return path.normalize(c);
  }
  return null;
}

function isUiComponentFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.tsx' || ext === '.jsx') return true;

  const rel = posix(path.relative(repoRoot, filePath));
  return /^src\/app\/.+\/(page|layout|not-found)\.(tsx|jsx|ts|js)$/.test(rel) || /^src\/app\/(page|layout|not-found)\.(tsx|jsx|ts|js)$/.test(rel);
}

function collectImports(sourceFile, currentFile) {
  const map = {};

  function resolveSpecifier(spec) {
    if (!spec || typeof spec !== 'string') return null;
    return resolveImport(currentFile, spec);
  }

  function collectDynamicSpecifierFromInitializer(initNode) {
    if (!initNode || !ts.isCallExpression(initNode)) return null;

    // next/dynamic(() => import('...'))
    if (
      ts.isIdentifier(initNode.expression) &&
      initNode.expression.text === 'dynamic' &&
      initNode.arguments.length > 0
    ) {
      const loader = initNode.arguments[0];
      if (ts.isArrowFunction(loader) || ts.isFunctionExpression(loader)) {
        if (ts.isCallExpression(loader.body) && loader.body.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = loader.body.arguments[0];
          if (arg && ts.isStringLiteral(arg)) return resolveSpecifier(arg.text);
        }

        if (ts.isBlock(loader.body)) {
          for (const stmt of loader.body.statements) {
            if (!ts.isReturnStatement(stmt) || !stmt.expression) continue;
            const expr = stmt.expression;
            if (ts.isCallExpression(expr) && expr.expression.kind === ts.SyntaxKind.ImportKeyword) {
              const arg = expr.arguments[0];
              if (arg && ts.isStringLiteral(arg)) return resolveSpecifier(arg.text);
            }
          }
        }
      }
    }

    // React.lazy(() => import('...'))
    if (
      ts.isPropertyAccessExpression(initNode.expression) &&
      ts.isIdentifier(initNode.expression.expression) &&
      initNode.expression.expression.text === 'React' &&
      initNode.expression.name.text === 'lazy' &&
      initNode.arguments.length > 0
    ) {
      const loader = initNode.arguments[0];
      if (ts.isArrowFunction(loader) || ts.isFunctionExpression(loader)) {
        if (ts.isCallExpression(loader.body) && loader.body.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = loader.body.arguments[0];
          if (arg && ts.isStringLiteral(arg)) return resolveSpecifier(arg.text);
        }
      }
    }

    return null;
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      const resolved = resolveImport(currentFile, spec);
      if (resolved && node.importClause) {
        const ic = node.importClause;
        if (ic.isTypeOnly) {
          ts.forEachChild(node, visit);
          return;
        }
        if (ic.name) map[ic.name.text] = resolved;
        if (ic.namedBindings) {
          if (ts.isNamedImports(ic.namedBindings)) {
            for (const el of ic.namedBindings.elements) {
              if (el.isTypeOnly) continue;
              const local = (el.name && el.name.text) || null;
              if (local) map[local] = resolved;
            }
          } else if (ts.isNamespaceImport(ic.namedBindings)) {
            map[ic.namedBindings.name.text] = resolved;
          }
        }
      }
    }

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        const resolved = collectDynamicSpecifierFromInitializer(decl.initializer);
        if (resolved) map[decl.name.text] = resolved;
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return map;
}

function jsxTagName(tag) {
  if (!tag) return null;
  if (ts.isIdentifier(tag)) return tag.text;
  if (ts.isPropertyAccessExpression(tag)) return tag.name.text;
  return null;
}

function analyzeFile(filePath, cache) {
  const norm = path.normalize(filePath);
  if (cache[norm]) return cache[norm];
  const sourceText = safeRead(norm);
  const lineCount = sourceText ? sourceText.split(/\r?\n/).length : 0;
  const sf = ts.createSourceFile(norm, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const importMap = collectImports(sf, norm);
  const jsxComponents = new Set();
  const intrinsicTags = new Set();
  const declaredTopLevel = new Set();
  const valueComponentRefs = new Set();
  const redirects = [];

  for (const m of sourceText.matchAll(/redirect\(\s*['\"`]([^'\"`]+)['\"`]\s*\)/g)) {
    redirects.push(m[1]);
  }

  function isTopLevel(node) {
    return node.parent && ts.isSourceFile(node.parent);
  }

  function isImportBindingIdentifier(node) {
    const p = node.parent;
    return Boolean(
      p && (
        ts.isImportClause(p) ||
        ts.isImportSpecifier(p) ||
        ts.isNamespaceImport(p) ||
        ts.isNamedImports(p) ||
        ts.isImportDeclaration(p)
      )
    );
  }

  function isTypeContext(node) {
    let cur = node.parent;
    while (cur) {
      if (ts.isTypeNode(cur)) return true;
      if (
        ts.isStatement(cur) ||
        ts.isExpression(cur) ||
        ts.isJsxElement(cur) ||
        ts.isJsxSelfClosingElement(cur) ||
        ts.isSourceFile(cur)
      ) {
        return false;
      }
      cur = cur.parent;
    }
    return false;
  }

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && isTopLevel(node) && node.name) {
      declaredTopLevel.add(node.name.text);
    }
    if (ts.isClassDeclaration(node) && isTopLevel(node) && node.name) {
      declaredTopLevel.add(node.name.text);
    }
    if (ts.isVariableStatement(node) && isTopLevel(node)) {
      for (const d of node.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) declaredTopLevel.add(d.name.text);
      }
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = jsxTagName(node.tagName);
      if (name) {
        if (/^[A-Z]/.test(name)) jsxComponents.add(name);
        else intrinsicTags.add(name);
      }
    }

    if (ts.isIdentifier(node) && analysisImportMapHas(importMap, node.text)) {
      if (!isImportBindingIdentifier(node) && !isTypeContext(node)) {
        valueComponentRefs.add(node.text);
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);

  const tabHits = [];
  const tagList = [...jsxComponents, ...intrinsicTags];
  for (const key of TAB_KEYWORDS) {
    if (key === 'tab=') {
      if (/tab\s*=/.test(sourceText)) tabHits.push('query param tab=');
    } else {
      if (sourceText.includes(key) || tagList.includes(key)) tabHits.push(key);
    }
  }

  const analysis = {
    file: norm,
    relFile: posix(path.relative(repoRoot, norm)),
    lineCount,
    importMap,
    jsxComponents: Array.from(jsxComponents).sort(),
    intrinsicTags: Array.from(intrinsicTags).sort(),
    declaredTopLevel: Array.from(declaredTopLevel).sort(),
    valueComponentRefs: Array.from(valueComponentRefs).sort(),
    tabSignals: Array.from(new Set(tabHits)),
    redirects
  };
  cache[norm] = analysis;
  return analysis;
}

function analysisImportMapHas(importMap, symbol) {
  return Object.prototype.hasOwnProperty.call(importMap, symbol);
}

function routeFromFile(file) {
  const rel = posix(path.relative(appDir, file));
  const parts = rel.split('/');
  const base = parts[parts.length - 1];
  const name = base.split('.')[0];
  const dirs = parts.slice(0, -1);
  if (name === 'page') {
    return dirs.length ? `/${dirs.join('/')}` : '/';
  }
  if (name === 'not-found') {
    return dirs.length ? `/${dirs.join('/')}/_not-found` : '/_not-found';
  }
  return `/${dirs.join('/')}`;
}

function routeFromHandlerFile(file) {
  const rel = posix(path.relative(appDir, file));
  const routePath = rel.replace(/\/route\.(tsx|jsx|ts|js)$/i, '');
  return routePath ? `/${routePath}` : '/';
}

function extractHttpMethods(sourceText) {
  const methods = [];
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    const re = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`);
    if (re.test(sourceText)) methods.push(method);
  }
  return methods;
}

function childEntries(analysis) {
  const imported = [];
  const internal = [];
  const importedByName = new Set();
  const internalByName = new Set();

  for (const comp of analysis.jsxComponents) {
    if (analysis.importMap[comp] && isUiComponentFile(analysis.importMap[comp])) {
      imported.push({ name: comp, file: analysis.importMap[comp], origin: 'imported-file' });
      importedByName.add(comp);
    } else if (analysis.declaredTopLevel.includes(comp)) {
      internal.push({ name: comp, origin: 'internal-component' });
      internalByName.add(comp);
    }
  }

  // Capture component registries/maps where imported components are referenced
  // indirectly and rendered later (e.g. ActiveSection pattern in settings shell).
  for (const [symbol, file] of Object.entries(analysis.importMap)) {
    if (!/^[A-Z]/.test(symbol)) continue;
    if (!isUiComponentFile(file)) continue;
    if (!(analysis.valueComponentRefs || []).includes(symbol)) continue;
    if (importedByName.has(symbol) || internalByName.has(symbol)) continue;
    imported.push({ name: symbol, file, origin: 'imported-file' });
    importedByName.add(symbol);
  }

  return { imported, internal };
}

function buildTree(file, cache, maxDepth = 4, depth = 0, seen = new Set()) {
  const norm = path.normalize(file);
  const analysis = analyzeFile(norm, cache);
  const node = {
    file: analysis.relFile,
    lineCount: analysis.lineCount,
    intrinsicTags: analysis.intrinsicTags,
    tabSignals: analysis.tabSignals,
    children: []
  };

  if (depth >= maxDepth) return node;
  if (seen.has(norm)) {
    node.cycle = true;
    return node;
  }

  seen.add(norm);
  const c = childEntries(analysis);
  for (const child of c.imported) {
    node.children.push({
      name: child.name,
      origin: child.origin,
      ...buildTree(child.file, cache, maxDepth, depth + 1, new Set(seen))
    });
  }
  for (const inr of c.internal) {
    node.children.push({
      name: inr.name,
      origin: inr.origin,
      file: analysis.relFile,
      lineCount: analysis.lineCount,
      intrinsicTags: analysis.intrinsicTags,
      tabSignals: analysis.tabSignals,
      children: []
    });
  }
  return node;
}

function flattenReachable(tree, acc = new Set()) {
  if (!tree || !tree.file) return acc;
  acc.add(path.normalize(path.join(repoRoot, tree.file)));
  for (const c of tree.children || []) flattenReachable(c, acc);
  return acc;
}

function treeToLines(tree, indent = 0) {
  const pad = '  '.repeat(indent);
  const out = [];
  const name = tree.name ? `${tree.name} -> ` : '';
  out.push(`${pad}- ${name}${tree.file} [${tree.lineCount} lines] (${(tree.origin || 'root')})`);
  for (const c of tree.children || []) out.push(...treeToLines(c, indent + 1));
  return out;
}

function mdTable(headers, rows) {
  const h = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(r => `| ${r.map(v => String(v).replace(/\n/g, ' ')).join(' | ')} |`);
  return [h, sep, ...body].join('\n');
}

function extractSettingsTabs(configFile) {
  if (!fs.existsSync(configFile)) return [];
  const text = safeRead(configFile);
  const sf = ts.createSourceFile(configFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const tabs = [];

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'settingsTabs' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(item)) continue;
        let id = '';
        let label = '';
        for (const prop of item.properties) {
          if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
          if (prop.name.text === 'id' && ts.isStringLiteral(prop.initializer)) id = prop.initializer.text;
          if (prop.name.text === 'label' && ts.isStringLiteral(prop.initializer)) label = prop.initializer.text;
        }
        if (id) tabs.push({ id, label: label || id, route: `/settings?tab=${id}` });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return tabs;
}

function extractNewsCategories(file) {
  if (!fs.existsSync(file)) return [];
  const text = safeRead(file);
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const categories = [];

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'NEWS_CATEGORIES' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(item)) continue;
        let id = '';
        let name = '';
        let route = '';
        for (const prop of item.properties) {
          if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
          if (prop.name.text === 'id' && ts.isStringLiteral(prop.initializer)) id = prop.initializer.text;
          if (prop.name.text === 'name' && ts.isStringLiteral(prop.initializer)) name = prop.initializer.text;
          if (prop.name.text === 'path' && ts.isStringLiteral(prop.initializer)) route = prop.initializer.text;
        }
        if (route) categories.push({ id: id || route, name: name || id || route, route });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return categories;
}

ensureDir(docsDir);

const allAppFiles = listFilesRecursive(appDir).filter(f => COMPONENT_FILE_RE.test(f));
const routeFiles = allAppFiles.filter(f => ROUTE_FILE_RE.test(f));
const routeHandlerFiles = allAppFiles.filter(f => ROUTE_HANDLER_FILE_RE.test(f));

const componentRoots = [
  path.join(repoRoot, 'src', 'components'),
  path.join(repoRoot, 'src', 'app', 'components')
];
const moduleFiles = componentRoots.flatMap(d => listFilesRecursive(d)).filter(f => COMPONENT_FILE_RE.test(f));

const cache = {};
const routes = routeFiles
  .map(f => {
    const a = analyzeFile(f, cache);
    const c = childEntries(a);
    const tree = buildTree(f, cache, 4);
    return {
      route: routeFromFile(f),
      file: a.relFile,
      redirects: a.redirects,
      lineCount: a.lineCount,
      importMap: a.importMap,
      jsxComponents: a.jsxComponents,
      intrinsicTags: a.intrinsicTags,
      declaredTopLevel: a.declaredTopLevel,
      tabSignals: a.tabSignals,
      directImportedChildren: c.imported.map(x => ({ name: x.name, file: posix(path.relative(repoRoot, x.file)), origin: x.origin })),
      internalChildren: c.internal,
      tree
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const moduleAudit = moduleFiles
  .map(f => {
    const a = analyzeFile(f, cache);
    const c = childEntries(a);
    return {
      file: a.relFile,
      directChildComponents: c.imported.map(x => ({ name: x.name, file: posix(path.relative(repoRoot, x.file)) })),
      intrinsicTags: a.intrinsicTags,
      tabSignals: a.tabSignals,
      lineCount: a.lineCount
    };
  })
  .sort((a, b) => a.file.localeCompare(b.file));

const routeHandlers = routeHandlerFiles
  .map((f) => {
    const text = safeRead(f);
    const lineCount = text ? text.split(/\r?\n/).length : 0;
    return {
      route: routeFromHandlerFile(f),
      file: posix(path.relative(repoRoot, f)),
      lineCount,
      methods: extractHttpMethods(text)
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const reachable = new Set();
for (const r of routes) flattenReachable(r.tree, reachable);

const globalLayoutFile = [
  path.join(appDir, 'layout.tsx'),
  path.join(appDir, 'layout.jsx'),
  path.join(appDir, 'layout.ts'),
  path.join(appDir, 'layout.js')
].find(f => fs.existsSync(f));

const globalLayoutChain = globalLayoutFile ? buildTree(globalLayoutFile, cache, 4) : null;
if (globalLayoutChain) {
  flattenReachable(globalLayoutChain, reachable);
}

for (const m of moduleAudit) {
  m.reachableFromRoute = reachable.has(path.normalize(path.join(repoRoot, m.file)));
}

const orphanModules = moduleAudit.filter(m => !m.reachableFromRoute).map(m => m.file);

const dynamicRoutes = routes.filter(r => /\[[^/]+\]/.test(r.route)).map(r => r.route);
const newsRoutes = routes.filter(r => r.route.includes('/news')).map(r => r.route);
const settingsRoutes = routes.filter(r => r.route.toLowerCase().includes('setting')).map(r => r.route);
const settingsTabs = extractSettingsTabs(path.join(repoRoot, 'src', 'components', 'settings', 'settings-config.ts'));
const newsCategoryTabs = extractNewsCategories(path.join(repoRoot, 'src', 'components', 'News', 'NewsCategoryTabs.tsx'));

const metrics = {
  routeCount: routes.length,
  routeHandlerCount: routeHandlers.length,
  moduleCount: moduleAudit.length,
  componentFileCount: moduleAudit.length,
  reachableComponentFiles: moduleAudit.filter(m => m.reachableFromRoute).length,
  orphanComponentFiles: orphanModules.length
};

const artifact = {
  timestamp: new Date().toISOString(),
  scope: {
    appDir: posix(path.relative(repoRoot, appDir)),
    componentDirs: componentRoots.map(d => posix(path.relative(repoRoot, d)))
  },
  metrics,
  globalLayoutChain,
  routes,
  routeHandlers,
  moduleAudit,
  orphans: orphanModules,
  matrices: {
    newsRoutes,
    settingsRoutes,
    dynamicRoutes,
    settingsTabs,
    newsCategoryTabs
  }
};

fs.writeFileSync(outJson, JSON.stringify(artifact, null, 2), 'utf8');

const lines = [];
lines.push('# ROUTE UI AUDIT REPORT');
lines.push('');
lines.push('## 1. Header');
lines.push(`- Timestamp: ${artifact.timestamp}`);
lines.push('- Scope: src/app route files and src/components + src/app/components modules');
lines.push('');
lines.push('## 2. Executive summary metrics');
lines.push(mdTable(['Metric', 'Value'], [
  ['Total routes', metrics.routeCount],
  ['Total route handlers', metrics.routeHandlerCount],
  ['Module files scanned', metrics.moduleCount],
  ['Component files', metrics.componentFileCount],
  ['Reachable component files', metrics.reachableComponentFiles],
  ['Orphan component files', metrics.orphanComponentFiles]
]));
lines.push('');
lines.push('## 3. Global layout chain (from src/app/layout.tsx and AppShell)');
if (globalLayoutChain) {
  lines.push('```txt');
  lines.push(...treeToLines(globalLayoutChain));
  lines.push('```');
} else {
  lines.push('No global layout file found under src/app/layout.*');
}
lines.push('');
lines.push('## 4. Route coverage table (all routes)');
lines.push(mdTable(
  ['Route', 'File', 'Lines', 'Redirect aliases', 'Tab systems'],
  routes.map(r => [
    r.route,
    r.file,
    r.lineCount,
    r.redirects.join(', ') || '-',
    r.tabSignals.join(', ') || '-'
  ])
));
lines.push('');
lines.push('## 5. Detailed route audit');
for (const r of routes) {
  lines.push(`### Route: ${r.route}`);
  lines.push(`- Parent file: ${r.file}`);
  lines.push(`- Direct child components: ${r.directImportedChildren.map(x => `${x.name} -> ${x.file}`).join('; ') || '-'}`);
  lines.push(`- Internal child components: ${r.internalChildren.map(x => x.name).join(', ') || '-'}`);
  lines.push(`- Intrinsic UI elements: ${r.intrinsicTags.join(', ') || '-'}`);
  lines.push(`- Tab systems: ${r.tabSignals.join(', ') || '-'}`);
  lines.push('- Nested component tree:');
  lines.push('```txt');
  lines.push(...treeToLines(r.tree));
  lines.push('```');
  lines.push('');
}
lines.push('## 6. Sub-pages and sub-tabs matrix (news categories, settings tabs, dynamic routes)');
lines.push(mdTable(['Category', 'Entries'], [
  ['News related routes', newsRoutes.join(', ') || '-'],
  ['News category tabs (from component)', newsCategoryTabs.map((tab) => `${tab.name} -> ${tab.route}`).join('; ') || '-'],
  ['Settings related routes', settingsRoutes.join(', ') || '-'],
  ['Settings query tabs (from config)', settingsTabs.map((tab) => `${tab.label} -> ${tab.route}`).join('; ') || '-'],
  ['Dynamic routes', dynamicRoutes.join(', ') || '-']
]));
lines.push('');
lines.push('## 7. Route handler audit (src/app/**/route.*)');
if (routeHandlers.length) {
  lines.push(mdTable(
    ['Handler route', 'File', 'Lines', 'Methods'],
    routeHandlers.map((h) => [h.route, h.file, h.lineCount, h.methods.join(', ') || '-'])
  ));
} else {
  lines.push('- No route handler files found.');
}
lines.push('');
lines.push('## 8. Module audit (src/components and src/app/components)');
lines.push(mdTable(
  ['Module file', 'Direct child components', 'Intrinsic tags', 'Reachable from any route', 'Tab systems'],
  moduleAudit.map(m => [
    m.file,
    m.directChildComponents.map(x => `${x.name} -> ${x.file}`).join('; ') || '-',
    m.intrinsicTags.join(', ') || '-',
    m.reachableFromRoute ? 'yes' : 'no',
    m.tabSignals.join(', ') || '-'
  ])
));
lines.push('');
lines.push('## 9. Orphan/unreachable components list');
if (orphanModules.length) {
  for (const o of orphanModules) lines.push(`- ${o}`);
} else {
  lines.push('- None');
}
lines.push('');
lines.push('## 10. Risks and recommendations');
lines.push('- Risk: orphan components increase maintenance cost and dead code exposure.');
lines.push('- Risk: deep route trees can hide UI inconsistencies across nested pages.');
lines.push('- Recommendation: enforce route-level ownership and remove or document orphan modules.');
lines.push('- Recommendation: consolidate tab systems to shared primitives for consistent behavior.');
lines.push('- Recommendation: add CI checks for route coverage and redirect alias validation.');

fs.writeFileSync(outMd, `${lines.join('\n')}\n`, 'utf8');

console.log(`Routes: ${metrics.routeCount}`);
console.log(`Markdown report: ${posix(path.relative(repoRoot, outMd))}`);
console.log(`JSON artifact: ${posix(path.relative(repoRoot, outJson))}`);
console.log(`Orphan components: ${metrics.orphanComponentFiles}`);
