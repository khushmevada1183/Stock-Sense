"use client";

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
        { name: 'Top Gainers', href: '/stocks/gainers' },
        { name: 'Top Losers', href: '/stocks/losers' },
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
    <footer className="border-t border-gray-200 dark:border-gray-800/30 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Footer Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.heading} className="col-span-1 text-center md:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-neon-400 mb-3">
                {group.heading}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-neon-400 dark:text-gray-400 dark:hover:text-neon-400 transition-colors duration-200"
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
            <div className="flex items-center justify-center md:justify-start mb-4">
              <span className="font-mono text-xl font-bold text-gray-900 dark:text-neon-400 neon-glow-text">
                Stock
              </span>
              <span className="font-flex text-xl font-light text-gray-800 dark:text-gray-300 ml-1">
                Sense
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center text-white hover:bg-neon-500 transition-colors duration-200"
                  aria-label={social.name}
                  title={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay updated with market trends
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-850 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Indian Stock Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            This platform is for informational purposes only and does not constitute financial advice.
          </p>
          <div className="mt-2">
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-neon-400 dark:text-gray-500 dark:hover:text-neon-400 transition-colors duration-200">
              Sitemap
            </Link>
            <span className="text-gray-500 mx-2">|</span>
            <Link href="/accessibility" className="text-xs text-gray-500 hover:text-neon-400 dark:text-gray-500 dark:hover:text-neon-400 transition-colors duration-200">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 

