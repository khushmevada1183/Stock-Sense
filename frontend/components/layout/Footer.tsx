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
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-around">
          {/* Footer Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.heading} className="w-full md:w-auto px-4 mb-6 md:mb-0 text-center md:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {group.heading}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Indian Stock Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            This platform is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 