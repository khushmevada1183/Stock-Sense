'use client';

import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      heading: 'Markets',
      links: [
        { name: 'Stocks', href: '/stocks' },
        { name: 'IPOs', href: '/ipo' },
        { name: 'Market News', href: '/news' },
      ]
    },
    {
      heading: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Terms of Use', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Contact Us', href: '/contact' }
      ]
    },
    {
      heading: 'Resources',
      links: [
        { name: 'Learning Center', href: '/learn' },
        { name: 'FAQs', href: '/faq' },
        { name: 'Blog', href: '/blog' },
        { name: 'API', href: '/api-docs' }
      ]
    }
  ];
  
  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: 'https://twitter.com/stocksense' },
    { name: 'LinkedIn', icon: 'in', href: 'https://linkedin.com/company/stocksense' },
    { name: 'GitHub', icon: '⌨', href: 'https://github.com/stocksense' },
    { name: 'Instagram', icon: '📸', href: 'https://instagram.com/stocksense' },
  ];
  
  return (
    <footer className="relative mt-10 border-t border-[color:var(--app-border)] bg-[color:var(--app-surface)]/80 backdrop-blur-xl">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--app-accent)]/45 to-transparent" />

      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {footerLinks.map((group) => (
            <div key={group.heading} className="col-span-1 text-center md:text-left">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--app-accent-strong)]">
                {group.heading}
              </h3>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center -mx-1 px-1 text-sm text-[color:var(--app-text-3)] transition-colors duration-300 hover:text-[color:var(--app-text-1)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-5">
              <span className="font-mono text-xl font-bold text-[color:var(--app-accent-strong)]">
                Stock
              </span>
              <span className="font-flex ml-1 text-xl font-light text-[color:var(--app-text-2)]">
                Sense
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-5">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] text-[color:var(--app-text-3)] transition-all duration-300 hover:border-[color:var(--app-accent)]/30 hover:bg-[color:var(--app-accent-soft)] hover:text-[color:var(--app-accent-strong)]"
                  aria-label={social.name}
                  title={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-[color:var(--app-text-3)]">
              Stay updated with market trends
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--app-border)] pt-6 text-center">
          <p className="text-sm text-[color:var(--app-text-3)]">
            &copy; {currentYear} Indian Stock Analyzer. All rights reserved.
          </p>
          <p className="mt-1.5 text-xs text-[color:var(--app-text-3)]">
            This platform is for informational purposes only and does not constitute financial advice.
          </p>
          <div className="mt-3 flex items-center justify-center space-x-3">
            <Link href="/sitemap" className="inline-flex min-h-[44px] items-center px-2 text-xs text-[color:var(--app-text-3)] transition-colors duration-300 hover:text-[color:var(--app-accent-strong)]">
              Sitemap
            </Link>
            <span className="text-xs text-[color:var(--app-text-3)]">•</span>
            <Link href="/accessibility" className="inline-flex min-h-[44px] items-center px-2 text-xs text-[color:var(--app-text-3)] transition-colors duration-300 hover:text-[color:var(--app-accent-strong)]">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
