'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card } from '../../components/ui/card';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { AlertTriangle, Shield, CheckCircle, Clock, DownloadCloud } from 'lucide-react';

// Mock data for visualizations
const dataUsageStats = [
  { name: 'Analytics', value: 45, color: '#3b82f6' },
  { name: 'User Preferences', value: 25, color: '#10b981' },
  { name: 'Authentication', value: 20, color: '#f59e0b' },
  { name: 'Error Tracking', value: 10, color: '#ef4444' },
];

const complianceMetrics = [
  { name: 'GDPR', compliance: 100 },
  { name: 'CCPA', compliance: 100 },
  { name: 'PIPEDA', compliance: 95 },
  { name: 'ISO 27001', compliance: 90 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function TermsPage() {
  const mainRef = useRef(null);
  const cardsRef = useRef(null);
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
    <main 
      ref={mainRef}
      className="container mx-auto px-4 py-12 min-h-screen"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Terms of Use
      </h1>
      
      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
        Welcome to Indian Stock Analyzer. The following terms and conditions govern your use of our platform.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {[
          { 
            title: "Security First", 
            description: "Your data security is our highest priority", 
            icon: <Shield className="w-8 h-8 text-blue-500" />,
            color: "bg-blue-100 dark:bg-blue-900/30"
          },
          { 
            title: "SEBI Compliant", 
            description: "We adhere to all SEBI regulations and guidelines", 
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            color: "bg-green-100 dark:bg-green-900/30"
          },
          { 
            title: "Regular Updates", 
            description: "Our terms are updated regularly to match regulations", 
            icon: <Clock className="w-8 h-8 text-amber-500" />,
            color: "bg-amber-100 dark:bg-amber-900/30"
          }
        ].map((item, index) => (
          <div 
            key={index}
            ref={addToSectionsRefs}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className={`rounded-full w-16 h-16 flex items-center justify-center ${item.color} mb-4 mx-auto`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">{item.description}</p>
          </div>
        ))}
      </div>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            By accessing or using the Indian Stock Analyzer service, you agree to be bound by these Terms of Use. 
            If you disagree with any part of these terms, you may not access the service.
          </p>
          <p>
            We reserve the right to update or change our Terms of Use at any time. Your continued use of the 
            service following the posting of any changes constitutes acceptance of those changes.
          </p>
          <div className="flex items-center p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 mt-4">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm">
              Last updated: May 15, 2025. Please review our terms periodically for changes.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section 
          ref={addToSectionsRefs}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6">2. Data Collection & Usage</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
            <p>
              We collect and use your data in accordance with our Privacy Policy. The following chart 
              illustrates how we utilize collected data:
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataUsageStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dataUsageStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Usage']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    color: '#e5e7eb'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section 
          ref={addToSectionsRefs}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6">3. Privacy Compliance</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
            <p>
              Indian Stock Analyzer maintains compliance with global privacy standards to ensure 
              your data is always protected.
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={complianceMetrics} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Compliance']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    color: '#e5e7eb'
                  }}
                />
                <Bar dataKey="compliance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">4. Account Terms</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            You are responsible for safeguarding the password you use to access the service and for
            any activities or actions under your password.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately
            upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { title: "Password Security", description: "Use strong passwords with at least 12 characters" },
              { title: "Account Sharing", description: "Accounts cannot be shared between multiple users" },
              { title: "API Access", description: "API keys must be safeguarded and not shared publicly" },
              { title: "Account Inactivity", description: "Accounts inactive for 12+ months may be suspended" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">5. Downloads & Software</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            Any downloadable content or software available through our service is governed by 
            the following terms and restrictions:
          </p>
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <DownloadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="ml-4 text-lg font-semibold">Data Downloads</h3>
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Limited to 100 downloads per day</li>
                <li>Cannot be redistributed commercially</li>
                <li>Data attribution required</li>
                <li>24-hour usage limitation</li>
              </ul>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="ml-4 text-lg font-semibold">API Usage</h3>
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Rate limited to 100 calls per minute</li>
                <li>API keys are non-transferable</li>
                <li>Cannot proxy API responses</li>
                <li>Valid for registered application only</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">6. Contact Information</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          If you have questions about these Terms of Use, please contact us:
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 inline-block">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> terms@indianstockanalyzer.com<br/>
            <strong>Address:</strong> 123 Financial District, Mumbai, India 400001<br/>
            <strong>Legal Department:</strong> +91 22-6789-0123
          </p>
        </div>
      </section>
    </main>
  );
}
