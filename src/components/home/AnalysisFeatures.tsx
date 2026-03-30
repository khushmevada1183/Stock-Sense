"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiBriefcase, FiFileText, FiGlobe, FiLayers, FiShield, FiSmile, FiTrendingUp, FiUserCheck, FiZap } from 'react-icons/fi';

interface FeatureItem {
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  outcomeWeight: number;
}

interface NodePosition {
  x: number;
  y: number;
}

interface EllipseRadii {
  x: number;
  y: number;
}

interface GraphSize {
  width: number;
  height: number;
}

interface EdgeGeometry {
  id: string;
  start: NodePosition;
  end: NodePosition;
  baseOpacity: number;
  strokeWidth: number;
  dashed?: boolean;
}

interface SignalTrack {
  id: string;
  start: NodePosition;
  end: NodePosition;
  duration: number;
  delay: number;
}

const CORE_NODE_RADII: EllipseRadii = {
  x: 8.2,
  y: 13.4,
};

const FACTOR_NODE_RADII: EllipseRadii = {
  x: 2.35,
  y: 3.75,
};

const SIGNAL_TRAIL_LENGTH_CM = 1;
const PX_PER_CM = 37.7952755906;

export default function AnalysisFeatures() {
  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<HTMLDivElement | null>(null);
  const [graphSize, setGraphSize] = React.useState<GraphSize>({ width: 0, height: 0 });
  const [coreSize, setCoreSize] = React.useState<GraphSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!graphRef.current || !coreRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSizes = () => {
      const graphRect = graphRef.current?.getBoundingClientRect();
      const coreRect = coreRef.current?.getBoundingClientRect();

      if (graphRect?.width && graphRect?.height) {
        setGraphSize({ width: graphRect.width, height: graphRect.height });
      }

      if (coreRect?.width && coreRect?.height) {
        setCoreSize({ width: coreRect.width, height: coreRect.height });
      }
    };

    updateSizes();

    const observer = new ResizeObserver(updateSizes);
    observer.observe(graphRef.current);
    observer.observe(coreRef.current);

    window.addEventListener('resize', updateSizes);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSizes);
    };
  }, []);

  const nodePositions = React.useMemo<NodePosition[]>(
    () =>
      features.map((_, index) =>
        getNodePosition(index, features.length, 39, 33)
      ),
    []
  );

  const ringConnections = React.useMemo<Array<[number, number]>>(
    () => features.map((_, index) => [index, (index + 1) % features.length]),
    []
  );

  const meshConnections = React.useMemo<Array<[number, number]>>(
    () => [
      ...createStepConnections(features.length, 3),
      ...createStepConnections(features.length, 4),
    ],
    []
  );

  const factorNodeRadii = React.useMemo<EllipseRadii>(
    () => getPixelRadiusInPercent(20, graphSize, FACTOR_NODE_RADII),
    [graphSize]
  );

  const coreNodeRadii = React.useMemo<EllipseRadii>(() => {
    if (!graphSize.width || !graphSize.height || !coreSize.width || !coreSize.height) {
      return CORE_NODE_RADII;
    }

    return {
      x: (coreSize.width / 2 / graphSize.width) * 100,
      y: (coreSize.height / 2 / graphSize.height) * 100,
    };
  }, [coreSize, graphSize]);

  const ringEdges = React.useMemo<EdgeGeometry[]>(
    () =>
      ringConnections.map(([from, to], index) => {
        const start = nodePositions[from];
        const end = nodePositions[to];
        const startEdge = getPointOnEllipse(start, end, factorNodeRadii);
        const endEdge = getPointOnEllipse(end, start, factorNodeRadii);

        return {
          id: `ring-${from}-${to}`,
          start: startEdge,
          end: endEdge,
          baseOpacity: 0.16 + (index % 3) * 0.05,
          strokeWidth: 1,
          dashed: true,
        };
      }),
    [ringConnections, nodePositions, factorNodeRadii]
  );

  const meshEdges = React.useMemo<EdgeGeometry[]>(
    () =>
      meshConnections.map(([from, to], index) => {
        const start = nodePositions[from];
        const end = nodePositions[to];
        const startEdge = getPointOnEllipse(start, end, factorNodeRadii);
        const endEdge = getPointOnEllipse(end, start, factorNodeRadii);

        return {
          id: `mesh-${from}-${to}`,
          start: startEdge,
          end: endEdge,
          baseOpacity: 0.1 + (index % 4) * 0.04,
          strokeWidth: 1,
        };
      }),
    [meshConnections, nodePositions, factorNodeRadii]
  );

  const coreEdges = React.useMemo<EdgeGeometry[]>(
    () =>
      nodePositions.map((position, index) => {
        const coreEdgePoint = getPointOnEllipse(
          { x: 50, y: 50 },
          position,
          coreNodeRadii
        );
        const factorEdgePoint = getPointOnEllipse(
          position,
          { x: 50, y: 50 },
          factorNodeRadii
        );

        return {
          id: `core-${features[index].title}`,
          start: coreEdgePoint,
          end: factorEdgePoint,
          baseOpacity: 0.26,
          strokeWidth: 1.25,
        };
      }),
    [nodePositions, coreNodeRadii, factorNodeRadii]
  );

  const signalTracks = React.useMemo<SignalTrack[]>(() => {
    const tracks: SignalTrack[] = [];

    coreEdges.forEach((edge, index) => {
      const reverse = index % 2 === 1;
      tracks.push({
        id: `signal-core-${index}`,
        start: reverse ? edge.end : edge.start,
        end: reverse ? edge.start : edge.end,
        duration: 2.2 + (index % 4) * 0.32,
        delay: index * 0.14,
      });
    });

    meshEdges.forEach((edge, index) => {
      if (index % 4 === 0) {
        tracks.push({
          id: `signal-mesh-${index}`,
          start: edge.start,
          end: edge.end,
          duration: 2.8 + (index % 3) * 0.35,
          delay: 0.6 + index * 0.08,
        });
      }
    });

    ringEdges.forEach((edge, index) => {
      if (index % 2 === 0) {
        tracks.push({
          id: `signal-ring-${index}`,
          start: edge.start,
          end: edge.end,
          duration: 3.1 + (index % 4) * 0.22,
          delay: 0.4 + index * 0.07,
        });
      }
    });

    return tracks;
  }, [coreEdges, meshEdges, ringEdges]);

  return (
    <div className="relative px-2 py-10 text-slate-900 sm:px-4 md:px-6 md:py-14 dark:text-slate-100">

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-5 flex items-center justify-center gap-2 font-[var(--font-roboto-mono)] text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-white" />
          Comprehensive Coverage
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 dark:text-white">
          Comprehensive Stock Analysis
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-slate-600 dark:text-zinc-300 md:text-[1.18rem]">
          Our platform analyzes stocks across ten key dimensions to give you the most complete picture.
        </p>

        <p className="mx-auto mt-4 max-w-2xl font-[var(--font-roboto-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-400">
          Indicative outcome weights • vary by market regime
        </p>
      </div>

      <div ref={graphRef} className="relative mx-auto mt-12 h-[min(92vw,31rem)] w-full max-w-5xl sm:h-[min(78vw,36rem)] lg:h-[36rem]">
        <svg aria-hidden className="absolute inset-0 h-full w-full text-slate-600 dark:text-slate-200">
          {ringEdges.map((edge, index) => (
            <motion.line
              key={edge.id}
              x1={`${edge.start.x}%`}
              y1={`${edge.start.y}%`}
              x2={`${edge.end.x}%`}
              y2={`${edge.end.y}%`}
              stroke="currentColor"
              strokeWidth={`${edge.strokeWidth}`}
              strokeDasharray={edge.dashed ? '4 8' : undefined}
              initial={{ opacity: edge.baseOpacity }}
              animate={{
                opacity: [edge.baseOpacity * 0.75, Math.min(edge.baseOpacity + 0.1, 0.4), edge.baseOpacity * 0.75],
              }}
              transition={{
                duration: 4.3 + (index % 3) * 0.7,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.12,
                ease: 'easeInOut',
              }}
            />
          ))}

          {meshEdges.map((edge, index) => (
            <motion.line
              key={edge.id}
              x1={`${edge.start.x}%`}
              y1={`${edge.start.y}%`}
              x2={`${edge.end.x}%`}
              y2={`${edge.end.y}%`}
              stroke="currentColor"
              strokeWidth={`${edge.strokeWidth}`}
              initial={{ opacity: edge.baseOpacity }}
              animate={{
                opacity: [edge.baseOpacity * 0.7, Math.min(edge.baseOpacity + 0.08, 0.32), edge.baseOpacity * 0.7],
              }}
              transition={{
                duration: 5 + (index % 4) * 0.65,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.25 + index * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}

          {coreEdges.map((edge, index) => (
            <motion.line
              key={edge.id}
              x1={`${edge.start.x}%`}
              y1={`${edge.start.y}%`}
              x2={`${edge.end.x}%`}
              y2={`${edge.end.y}%`}
              stroke="currentColor"
              strokeWidth={`${edge.strokeWidth}`}
              initial={{ opacity: edge.baseOpacity }}
              animate={{
                opacity: [edge.baseOpacity * 0.75, Math.min(edge.baseOpacity + 0.14, 0.44), edge.baseOpacity * 0.75],
              }}
              transition={{
                duration: 3.1 + (index % 5) * 0.32,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.12 + index * 0.09,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>

        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {signalTracks.map((track, index) => {
            const signalColor = '#facc15';
            const repeatDelay = 0.35 + (index % 3) * 0.25;
            const trailOffset = getTrailOffsetInPercent(
              track.start,
              track.end,
              graphSize,
              SIGNAL_TRAIL_LENGTH_CM
            );
            const glowOffset = getTrailOffsetInPercent(
              track.start,
              track.end,
              graphSize,
              SIGNAL_TRAIL_LENGTH_CM * 1.7
            );

            const startTail = {
              x: track.start.x - trailOffset.x,
              y: track.start.y - trailOffset.y,
            };

            const endTail = {
              x: track.end.x - trailOffset.x,
              y: track.end.y - trailOffset.y,
            };

            const startGlow = {
              x: track.start.x - glowOffset.x,
              y: track.start.y - glowOffset.y,
            };

            const endGlow = {
              x: track.end.x - glowOffset.x,
              y: track.end.y - glowOffset.y,
            };

            return (
              <g key={track.id}>
                <motion.line
                  x1={startGlow.x}
                  y1={startGlow.y}
                  x2={track.start.x}
                  y2={track.start.y}
                  stroke={signalColor}
                  strokeWidth="0.000003"
                  strokeLinecap="square"
                  animate={{
                    x1: [startGlow.x, endGlow.x],
                    y1: [startGlow.y, endGlow.y],
                    x2: [track.start.x, track.end.x],
                    y2: [track.start.y, track.end.y],
                    opacity: [0, 0.48, 0],
                  }}
                  transition={{
                    duration: track.duration,
                    delay: track.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay,
                    ease: 'linear',
                  }}
                  style={{ filter: `blur(0.25px) drop-shadow(0 0 4px ${signalColor})` }}
                />

                <motion.line
                  x1={startTail.x}
                  y1={startTail.y}
                  x2={track.start.x}
                  y2={track.start.y}
                  stroke={signalColor}
                  strokeWidth="0.2"
                  strokeLinecap="square"
                  animate={{
                    x1: [startTail.x, endTail.x],
                    y1: [startTail.y, endTail.y],
                    x2: [track.start.x, track.end.x],
                    y2: [track.start.y, track.end.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: track.duration,
                    delay: track.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay,
                    ease: 'linear',
                  }}
                  style={{ filter: `drop-shadow(0 0 2px ${signalColor}) drop-shadow(0 0 4px ${signalColor})` }}
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            ref={coreRef}
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[8.25rem] w-[8.25rem] flex-col items-center justify-center gap-1 rounded-full border border-slate-500/65 bg-[var(--app-bg)] px-3 text-center shadow-[0_16px_34px_rgba(15,23,42,0.18)] dark:border-white/45 dark:shadow-[0_18px_34px_rgba(0,0,0,0.45)] sm:h-[10.2rem] sm:w-[10.2rem]"
          >
            <span className="font-[var(--font-roboto-mono)] text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-zinc-300">
              Neural Core
            </span>
            <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.2rem]">
              AI Engine
            </h3>
            <p className="max-w-[8.25rem] text-[0.62rem] leading-relaxed text-slate-600 dark:text-zinc-300 sm:max-w-[8.7rem] sm:text-[0.7rem]">
              Multi-factor fusion across 10 market dimensions
            </p>
          </motion.div>
        </div>

        <ul className="absolute inset-0">
          {features.map((feature, index) => (
            <motion.li
              key={feature.title}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              style={{
                left: `${nodePositions[index].x}%`,
                top: `${nodePositions[index].y}%`,
              }}
              className="feature-card group absolute"
            >
              <div className="relative h-0 w-0">
                <span className="absolute left-[0.86rem] top-[-1.08rem] z-30 inline-flex min-w-[1.45rem] items-center justify-center rounded-full border border-slate-500/85 bg-white px-1.5 py-[0.04rem] font-[var(--font-roboto-mono)] text-[0.55rem] font-semibold tracking-[0.12em] text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.18)] dark:border-white/70 dark:bg-black dark:text-white dark:shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-[0.56rem]">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-500/70 bg-white/85 text-[0.9rem] text-slate-900 dark:border-white/55 dark:bg-black dark:text-white sm:text-[1rem]">
                  {feature.icon}
                </span>

                <div className="absolute left-0 top-[1.1rem] hidden min-w-[6.1rem] -translate-x-1/2 text-center sm:block">
                  <h3 className="text-[0.68rem] font-semibold leading-snug tracking-[-0.01em] text-slate-700 dark:text-zinc-100">
                    {feature.shortTitle}
                  </h3>
                  <span className="mt-0.5 block font-[var(--font-roboto-mono)] text-[0.56rem] font-semibold tabular-nums tracking-[0.08em] text-slate-600 dark:text-zinc-300">
                    {feature.outcomeWeight}%
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <ul className="relative mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {features.map((feature, index) => (
          <motion.li
            key={`${feature.title}-legend`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            className="border-b border-slate-300/70 px-1 py-3 last:border-b-0 dark:border-white/15"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                <span className="mr-2 font-[var(--font-roboto-mono)] text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {feature.title}
              </h3>
              <span className="shrink-0 font-[var(--font-roboto-mono)] text-xs font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {feature.outcomeWeight}%
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
              {feature.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function getNodePosition(index: number, total: number, radiusX: number, radiusY: number): NodePosition {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;

  return {
    x: 50 + Math.cos(angle) * radiusX,
    y: 50 + Math.sin(angle) * radiusY,
  };
}

function createStepConnections(total: number, step: number): Array<[number, number]> {
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];

  for (let index = 0; index < total; index += 1) {
    const target = (index + step) % total;
    const start = Math.min(index, target);
    const end = Math.max(index, target);
    const edgeKey = `${start}-${end}`;

    if (!seen.has(edgeKey)) {
      seen.add(edgeKey);
      edges.push([start, end]);
    }
  }

  return edges;
}

function getPointOnEllipse(center: NodePosition, target: NodePosition, radii: EllipseRadii): NodePosition {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (dx === 0 && dy === 0) {
    return center;
  }

  const scale = 1 /
    Math.sqrt((dx * dx) / (radii.x * radii.x) + (dy * dy) / (radii.y * radii.y));

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function getPixelRadiusInPercent(radiusPx: number, graphSize: GraphSize, fallback: EllipseRadii): EllipseRadii {
  if (!graphSize.width || !graphSize.height) {
    return fallback;
  }

  return {
    x: (radiusPx / graphSize.width) * 100,
    y: (radiusPx / graphSize.height) * 100,
  };
}

function getTrailOffsetInPercent(
  start: NodePosition,
  end: NodePosition,
  graphSize: GraphSize,
  trailLengthCm: number
): NodePosition {
  const trailPx = trailLengthCm * PX_PER_CM;

  if (!graphSize.width || !graphSize.height) {
    return { x: 0.08, y: 0.08 };
  }

  const dxPx = ((end.x - start.x) / 100) * graphSize.width;
  const dyPx = ((end.y - start.y) / 100) * graphSize.height;
  const lengthPx = Math.hypot(dxPx, dyPx);

  if (lengthPx === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (((dxPx / lengthPx) * trailPx) / graphSize.width) * 100,
    y: (((dyPx / lengthPx) * trailPx) / graphSize.height) * 100,
  };
}

const features: FeatureItem[] = [
  {
    title: 'Financial Fundamentals',
    shortTitle: 'Fundamentals',
    description: 'Analysis of EPS, P/E ratios, debt-to-equity, revenue growth, profit margins and other ratios.',
    icon: <FiBarChart2 className="h-5 w-5" />,
    outcomeWeight: 22
  },
  {
    title: 'Management Analysis',
    shortTitle: 'Management',
    description: 'Evaluation of leadership team, track record, governance practices, and management quality.',
    icon: <FiUserCheck className="h-5 w-5" />,
    outcomeWeight: 11
  },
  {
    title: 'Industry Trends',
    shortTitle: 'Industry',
    description: 'Insights into sector performance, competition analysis, market share, and industry dynamics.',
    icon: <FiLayers className="h-5 w-5" />,
    outcomeWeight: 10
  },
  {
    title: 'Government Policies',
    shortTitle: 'Policy',
    description: 'Impact assessment of regulatory changes, subsidies, taxation, and policy shifts on stocks.',
    icon: <FiShield className="h-5 w-5" />,
    outcomeWeight: 8
  },
  {
    title: 'Macroeconomic Indicators',
    shortTitle: 'Macro',
    description: 'Analysis of GDP growth, inflation, interest rates, and currency fluctuations affecting stocks.',
    icon: <FiGlobe className="h-5 w-5" />,
    outcomeWeight: 9
  },
  {
    title: 'News Analysis',
    shortTitle: 'News',
    description: 'Latest developments, news sentiment analysis, and event impact assessment for stocks.',
    icon: <FiFileText className="h-5 w-5" />,
    outcomeWeight: 7
  },
  {
    title: 'Technical Analysis',
    shortTitle: 'Technicals',
    description: 'Price patterns, moving averages, momentum indicators, and trend analysis for stocks.',
    icon: <FiTrendingUp className="h-5 w-5" />,
    outcomeWeight: 12
  },
  {
    title: 'Growth Potential',
    shortTitle: 'Growth',
    description: 'Evaluation of future expansion plans, market opportunities, and R&D investments.',
    icon: <FiZap className="h-5 w-5" />,
    outcomeWeight: 9
  },
  {
    title: 'Institutional Investments',
    shortTitle: 'Institutions',
    description: 'Tracking of FII/DII flows, major stake changes, block deals, and institutional sentiment.',
    icon: <FiBriefcase className="h-5 w-5" />,
    outcomeWeight: 6
  },
  {
    title: 'Market Psychology',
    shortTitle: 'Psychology',
    description: 'Analysis of sentiment indicators, investor behavior patterns, and market psychology.',
    icon: <FiSmile className="h-5 w-5" />,
    outcomeWeight: 6
  }
];