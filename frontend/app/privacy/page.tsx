'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Shield, Lock, Eye, Server, User, Database, Clock, CheckCircle2 } from 'lucide-react';

// Mock data for visualizations
const dataCategoryStats = [
  { name: 'Personal Data', protected: 100, regulated: 100 },
  { name: 'Financial Records', protected: 100, regulated: 100 },
  { name: 'Usage Analytics', protected: 90, regulated: 80 },
  { name: 'Preferences', protected: 95, regulated: 75 },
  { name: 'Device Info', protected: 85, regulated: 70 },
];

const dataRetentionPolicy = [
  { name: 'Account Info', months: 84 }, // 7 years
  { name: 'Financial Data', months: 60 }, // 5 years
  { name: 'Login History', months: 24 }, // 2 years
  { name: 'Usage Metrics', months: 12 }, // 1 year
  { name: 'Server Logs', months: 3 }, // 3 months
];

const securityMeasures = [
  { subject: 'Encryption', A: 100, fullMark: 100 },
  { subject: 'Access Control', A: 95, fullMark: 100 },
  { subject: 'Monitoring', A: 90, fullMark: 100 },
  { subject: 'Auth Security', A: 100, fullMark: 100 },
  { subject: 'Data Backups', A: 95, fullMark: 100 },
  { subject: 'Vulnerability Testing', A: 85, fullMark: 100 },
];

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function PrivacyPage() {
  const mainRef = useRef(null);
  const sectionsRef = useRef([]);
  const sectionContentsRef = useRef([]);

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

    // Content reveals with stagger
    sectionContentsRef.current.forEach((section, index) => {
      gsap.from(section?.children || [], {
        opacity: 0,
        y: 15,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.5 + (index * 0.2),
        ease: "power2.out"
      });
    });
  }, []);

  // Add sections to ref array for animations
  const addToSectionsRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Add section contents to ref array for animations
  const addToContentRefs = (el) => {
    if (el && !sectionContentsRef.current.includes(el)) {
      sectionContentsRef.current.push(el);
    }
  };

  return (
    <main 
      ref={mainRef}
      className="container mx-auto px-4 py-12 min-h-screen"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Privacy Policy
      </h1>
      
      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
        Indian Stock Analyzer is committed to protecting your privacy and ensuring your data remains secure.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { 
            title: "Data Protection", 
            description: "Your data is encrypted and protected", 
            icon: <Shield className="w-8 h-8 text-blue-500" />,
            color: "bg-blue-100 dark:bg-blue-900/30"
          },
          { 
            title: "Transparency", 
            description: "Clear policies on data usage and rights", 
            icon: <Eye className="w-8 h-8 text-green-500" />,
            color: "bg-green-100 dark:bg-green-900/30"
          },
          { 
            title: "User Control", 
            description: "Full control over your information", 
            icon: <User className="w-8 h-8 text-purple-500" />,
            color: "bg-purple-100 dark:bg-purple-900/30"
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
        <h2 className="text-2xl font-bold mb-6">1. Data We Collect</h2>
        <div 
          ref={addToContentRefs} 
          className="space-y-4 text-gray-700 dark:text-gray-300"
        >
          <p>
            Indian Stock Analyzer collects several types of information to provide and improve our services.
            Below is a breakdown of data categories and associated protections:
          </p>
          <div className="h-80 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataCategoryStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151',
                    color: '#e5e7eb' 
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="protected" 
                  name="Protection Level (%)" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="regulated" 
                  name="Regulatory Compliance (%)" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section 
          ref={addToSectionsRefs}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6">2. Data Retention</h2>
          <div 
            ref={addToContentRefs}
            className="space-y-4 text-gray-700 dark:text-gray-300 mb-6"
          >
            <p>
              We retain different types of data for varying periods as required by regulations
              and as necessary to provide our services. Here's our retention schedule:
            </p>
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-amber-500" />
              <span className="text-sm text-amber-500">All retention periods start from last account activity</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dataRetentionPolicy} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                <Tooltip 
                  formatter={(value) => [`${value} months`, 'Retention Period']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    color: '#e5e7eb'
                  }}
                />
                <Bar dataKey="months" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section 
          ref={addToSectionsRefs}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6">3. Security Measures</h2>
          <div 
            ref={addToContentRefs}
            className="space-y-4 text-gray-700 dark:text-gray-300 mb-6"
          >
            <p>
              We implement advanced security measures to protect your data from unauthorized 
              access, alteration, disclosure, or destruction.
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={securityMeasures}>
                <PolarGrid stroke="#4b5563" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                <Radar
                  name="Security Implementation"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Implementation']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    color: '#e5e7eb'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">4. Your Rights</h2>
        <div 
          ref={addToContentRefs}
          className="space-y-4 text-gray-700 dark:text-gray-300"
        >
          <p>
            Under data protection laws, you have rights regarding your personal data. These include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[
              { 
                title: "Access", 
                description: "Request copies of your personal data", 
                icon: <User className="w-5 h-5 text-blue-500" /> 
              },
              { 
                title: "Rectification", 
                description: "Request correction of inaccurate data", 
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> 
              },
              { 
                title: "Erasure", 
                description: "Request deletion of your personal data", 
                icon: <Database className="w-5 h-5 text-red-500" /> 
              },
              { 
                title: "Restriction", 
                description: "Request restriction of processing your data", 
                icon: <Lock className="w-5 h-5 text-amber-500" /> 
              },
              { 
                title: "Portability", 
                description: "Transfer your data to another service", 
                icon: <Server className="w-5 h-5 text-purple-500" /> 
              },
              { 
                title: "Objection", 
                description: "Object to processing of your data", 
                icon: <Eye className="w-5 h-5 text-indigo-500" /> 
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="mr-3 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6">
            To exercise any of these rights, please contact us at privacy@indianstockanalyzer.com.
            We will respond to your request within 30 days.
          </p>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">5. Cookies & Tracking</h2>
        <div 
          ref={addToContentRefs}
          className="space-y-4 text-gray-700 dark:text-gray-300"
        >
          <p>
            We use cookies and similar tracking technologies to track activity on our service and 
            store certain information. You can instruct your browser to refuse all cookies or to 
            indicate when a cookie is being sent.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { name: "Essential Cookies", always: true },
              { name: "Authentication Cookies", always: true },
              { name: "Analytics Cookies", always: false },
              { name: "Marketing Cookies", always: false },
              { name: "Preferences Cookies", always: false }
            ].map((cookie, idx) => (
              <div 
                key={idx} 
                className={`rounded-full px-4 py-2 text-sm ${
                  cookie.always 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {cookie.name}
                {cookie.always && <span className="ml-2 text-xs">(Required)</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
        className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">6. Changes to This Policy</h2>
        <div 
          ref={addToContentRefs}
          className="space-y-4 text-gray-700 dark:text-gray-300"
        >
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Posting the new Privacy Policy on this page</li>
            <li>Sending an email to registered users</li>
            <li>Displaying a notification within the application</li>
            <li>Updating the "last updated" date at the top of this Privacy Policy</li>
          </ul>
          <div className="bg-amber-100 dark:bg-amber-900/20 rounded-lg p-4 text-amber-800 dark:text-amber-500 flex items-start mt-4">
            <Clock className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Last updated:</strong> May 15, 2025. We encourage you to review this Privacy 
              Policy periodically to stay informed about how we are protecting your information.
            </p>
          </div>
        </div>
      </section>

      <section 
        ref={addToSectionsRefs}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6">7. Contact Us</h2>
        <div 
          ref={addToContentRefs}
          className="space-y-4 text-gray-700 dark:text-gray-300"
        >
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 inline-block">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> privacy@indianstockanalyzer.com<br/>
              <strong>Address:</strong> 123 Financial District, Mumbai, India 400001<br/>
              <strong>Data Protection Officer:</strong> +91 22-6789-0124
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
