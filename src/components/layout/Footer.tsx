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
    <footer className="relative border-t border-gray-800/30">
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-400/30 to-transparent" />
      
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Footer Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.heading} className="col-span-1 text-center md:text-left">
              <h3 className="font-semibold text-neon-400 mb-4 text-sm uppercase tracking-wider">
                {group.heading}
              </h3>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center px-1 -mx-1 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300 hover-underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logo and social media links */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-5">
              <span className="font-mono text-xl font-bold text-neon-400 neon-glow-text">
                Stock
              </span>
              <span className="font-flex text-xl font-light text-gray-300 ml-1">
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
                  className="h-11 w-11 rounded-full bg-gray-800/60 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-neon-400 hover:border-neon-400/30 hover:bg-gray-800/90 hover:shadow-neon-sm transition-all duration-300"
                  aria-label={social.name}
                  title={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Stay updated with market trends
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800/30 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} Indian Stock Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-1.5">
            This platform is for informational purposes only and does not constitute financial advice.
          </p>
          <div className="mt-3 flex items-center justify-center space-x-3">
            <Link href="/sitemap" className="inline-flex min-h-[44px] items-center px-2 text-xs text-gray-600 hover:text-neon-400 transition-colors duration-300">
              Sitemap
            </Link>
            <span className="text-gray-700 text-xs">•</span>
            <Link href="/accessibility" className="inline-flex min-h-[44px] items-center px-2 text-xs text-gray-600 hover:text-neon-400 transition-colors duration-300">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
