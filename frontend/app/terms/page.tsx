'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, FileText, AlertTriangle, CheckCircle2, Scale } from 'lucide-react';
import PageBackground from '@/components/layout/PageBackground';

export default function TermsPage() {
  const mainRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Main entrance animation
    gsap.from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out"
    });

    // Staggered sections animation
    gsap.from(sectionsRef.current, {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.3
    });
  }, []);

  // Add sections to ref array for animations
  const addToSectionsRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <PageBackground>
    <main 
      ref={mainRef}
        className="container mx-auto px-4 py-12"
    >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Terms of Use
      </h1>
      
        <p className="text-lg text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          Please read these terms carefully before using Indian Stock Analyzer services.
      </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { 
              title: "Legal Agreement", 
              description: "These terms constitute a binding legal agreement", 
              icon: <FileText className="w-8 h-8 text-neon-400" />,
              color: "bg-gray-800/50"
          },
          { 
              title: "User Responsibilities", 
              description: "Guidelines for proper platform usage", 
              icon: <Shield className="w-8 h-8 text-neon-400" />,
              color: "bg-gray-800/50"
          },
          { 
              title: "Compliance", 
              description: "Adherence to financial regulations and laws", 
              icon: <Scale className="w-8 h-8 text-neon-400" />,
              color: "bg-gray-800/50"
          }
        ].map((item, index) => (
          <div 
            key={index}
            ref={addToSectionsRefs}
              className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700 glass-premium"
          >
              <div className={`rounded-full w-16 h-16 flex items-center justify-center ${item.color} mb-4 mx-auto border border-neon-400/20`}>
              {item.icon}
            </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-white">{item.title}</h3>
              <p className="text-gray-300 text-center">{item.description}</p>
          </div>
        ))}
      </div>

        <div className="space-y-8">
      <section 
        ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
      >
            <h2 className="text-2xl font-bold mb-6 text-white">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-300">
          <p>
                By accessing or using the Indian Stock Analyzer platform, you agree to be bound by these Terms of Use. 
                If you do not agree to these terms, please do not use our services.
          </p>
          <p>
                We reserve the right to modify these terms at any time. Your continued use of the platform following 
                any changes constitutes your acceptance of the revised terms.
            </p>
        </div>
      </section>

        <section 
          ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
        >
            <h2 className="text-2xl font-bold mb-6 text-white">2. User Accounts</h2>
            <div className="space-y-4 text-gray-300">
            <p>
                To access certain features of the platform, you may be required to register for an account. You agree to:
            </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Take responsibility for all activities under your account</li>
              </ul>
          </div>
        </section>

        <section 
          ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
        >
            <h2 className="text-2xl font-bold mb-6 text-white">3. Financial Information Disclaimer</h2>
            <div className="space-y-4 text-gray-300">
            <p>
                The information provided on Indian Stock Analyzer is for informational and educational purposes only and 
                should not be construed as financial advice.
              </p>
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 text-amber-400 flex items-start mt-4">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Important:</strong> All investment decisions should be made after consulting with a qualified 
                  financial advisor and conducting your own research. Past performance is not indicative of future results.
            </p>
          </div>
          </div>
        </section>

      <section 
        ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
      >
            <h2 className="text-2xl font-bold mb-6 text-white">4. Intellectual Property</h2>
            <div className="space-y-4 text-gray-300">
          <p>
                All content on the Indian Stock Analyzer platform, including but not limited to text, graphics, logos, 
                icons, images, audio clips, and software, is the property of Indian Stock Analyzer and is protected by 
                copyright, trademark, and other intellectual property laws.
          </p>
          <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, 
                republish, download, store, or transmit any of the material on our platform without our prior written consent.
              </p>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
      >
            <h2 className="text-2xl font-bold mb-6 text-white">5. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-300">
          <p>
                In no event shall Indian Stock Analyzer, its directors, employees, partners, agents, suppliers, or affiliates 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your access to or use of or inability to access or use the service</li>
                <li>Any conduct or content of any third party on the service</li>
                <li>Any content obtained from the service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>
          </section>
          
          <section 
            ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">6. Contact Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="bg-gray-700 rounded-lg p-4 inline-block">
                <p>
                  <strong>Email:</strong> legal@indianstockanalyzer.com<br/>
                  <strong>Address:</strong> 123 Financial District, Mumbai, India 400001<br/>
                  <strong>Phone:</strong> +91 22-6789-0123
                </p>
          </div>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
      >
            <h2 className="text-2xl font-bold mb-6 text-white">7. Governing Law</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its 
                conflict of law provisions. Any disputes relating to these terms and conditions will be subject to the 
                exclusive jurisdiction of the courts of Mumbai, India.
        </p>
              <div className="bg-neon-400/10 border border-neon-400/30 rounded-lg p-4 text-neon-400 flex items-start mt-4">
                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Last Updated:</strong> May 15, 2025. By continuing to use our platform after any changes to these 
                  Terms, you agree to be bound by the revised terms.
                </p>
              </div>
            </div>
          </section>
        </div>
    </main>
    </PageBackground>
  );
}
