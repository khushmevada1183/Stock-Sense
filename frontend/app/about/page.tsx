'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { gsap } from 'gsap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, TrendingUp, Award, Target, Globe, Code, Zap, Shield, BookOpen } from 'lucide-react';

// Mock data for metrics
const companyStats = [
  { name: 'User Growth', value: 24500, increase: 27.8, color: '#3b82f6' },
  { name: 'Market Coverage', value: 98.5, increase: 12.4, color: '#10b981' },
  { name: 'Analysis Accuracy', value: 94.2, increase: 5.3, color: '#6366f1' },
  { name: 'Customer Satisfaction', value: 92.7, increase: 8.1, color: '#f59e0b' }
];

const teamGrowthData = [
  { year: '2020', employees: 12 },
  { year: '2021', employees: 25 },
  { year: '2022', employees: 42 },
  { year: '2023', employees: 68 },
  { year: '2024', employees: 95 },
  { year: '2025', employees: 120 }
];

const marketCoverageData = [
  { name: 'NSE', value: 65 },
  { name: 'BSE', value: 25 },
  { name: 'Others', value: 10 }
];

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

export default function AboutPage() {
  const mainRef = useRef(null);
  const cardsRef = useRef(null);
  const statsRef = useRef<HTMLDivElement[]>([]);
  const founderSectionRef = useRef(null);
  const visionSectionRef = useRef(null);

  useEffect(() => {
    // Animate page entry
    gsap.from(mainRef.current, { 
      opacity: 0, 
      y: 20, 
      duration: 0.8, 
      ease: "power3.out" 
    });

    // Animate cards with stagger
    gsap.from(cardsRef.current?.children || [], {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.3
    });

    // Animate founder section
    gsap.from(founderSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.5
    });

    // Animate vision section
    gsap.from(visionSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.7
    });

    // Animate stats numbers counting up
    statsRef.current.forEach((stat, index) => {
      const valueDisplay = stat.querySelector('.value-display');
      const targetValue = companyStats[index].value;
      
      // Create a proxy object that we can animate with GSAP
      const obj = { value: 0 };
      gsap.to(obj, { 
        value: targetValue, 
        duration: 2,
        delay: 0.5 + index * 0.2,
        ease: "power2.out",
        onUpdate: function() {
          if (valueDisplay) {
            if (targetValue >= 100) {
              valueDisplay.textContent = Math.round(obj.value).toLocaleString();
            } else {
              valueDisplay.textContent = obj.value.toFixed(1);
            }
          }
        }
      });
    });
  }, []);

  // Function to add stats refs
  const addToStatsRefs = (el: HTMLDivElement) => {
    if (el && !statsRef.current.includes(el)) {
      statsRef.current.push(el);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
    <main 
      ref={mainRef}
        className="container mx-auto px-4 py-12 relative z-10"
    >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        About Indian Stock Analyzer
      </h1>
      
      <div className="max-w-3xl mx-auto mb-12">
          <p className="text-lg text-gray-300 text-center leading-relaxed">
            Founded in 2020 by <span className="font-semibold text-neon-400">Khush Mevada</span>, 
          Indian Stock Analyzer has revolutionized how investors research and analyze 
          stocks from the Indian market by providing comprehensive, data-driven insights through an 
          intuitive platform. Our cutting-edge technology combines advanced algorithms with user-friendly 
          interfaces to deliver powerful stock analysis tools for investors of all experience levels.
        </p>
      </div>

      {/* Founder's Section */}
      <section ref={founderSectionRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Our Founder</h2>
          <div className="glass-premium rounded-xl shadow-lg p-6 border border-neon-400/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-48 h-48 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 border-4 border-neon-400/20">
                <Users className="w-24 h-24 text-neon-400" />
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-2 text-center md:text-left text-white">Khush Mevada</h3>
                <p className="text-neon-400 font-medium mb-4 text-center md:text-left">Founder & CEO</p>
                <p className="text-gray-300 mb-4">
                With a passion for financial markets and technology, Khush Mevada founded Indian Stock Analyzer 
                with the vision of democratizing access to sophisticated stock analysis tools. His background in 
                financial analysis and software development enabled him to create a platform that combines powerful 
                analytical capabilities with user-friendly interfaces.
              </p>
                <p className="text-gray-300 mb-4">
                Prior to founding Indian Stock Analyzer, Khush worked with leading financial institutions where he 
                identified a significant gap in the market for retail investors seeking professional-grade analysis 
                tools specifically tailored for Indian markets.
              </p>
                <p className="text-gray-300">
                Under his leadership, the company has grown from a small startup to a trusted platform used by 
                thousands of investors across India, with plans for continued expansion and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Our Mission</h2>
          <div className="glass-premium rounded-xl shadow-lg p-6 border border-neon-400/10">
          <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-neon-400" />
            </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Empowering Informed Investment</h3>
              <p className="text-gray-300 max-w-3xl">
              Our mission is to democratize access to sophisticated stock analysis for Indian 
              investors through cutting-edge technology and data analytics. We aim to empower 
              individuals to make informed investment decisions based on comprehensive, accurate, 
              and timely market insights, regardless of their experience level or portfolio size.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section ref={visionSectionRef} className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Vision & Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Innovation", 
              description: "Continuously developing new tools and features to stay at the forefront of stock analysis technology", 
              icon: <Zap className="w-8 h-8 text-amber-500" />,
              color: "bg-amber-100 dark:bg-amber-900/30"
            },
            { 
              title: "Accuracy", 
              description: "Maintaining the highest standards of data quality and analytical precision", 
              icon: <Target className="w-8 h-8 text-green-500" />,
              color: "bg-green-100 dark:bg-green-900/30"
            },
            { 
              title: "Security", 
              description: "Protecting user data and financial information with enterprise-grade security measures", 
              icon: <Shield className="w-8 h-8 text-blue-500" />,
              color: "bg-blue-100 dark:bg-blue-900/30"
            },
            { 
              title: "Education", 
              description: "Empowering investors through financial literacy and market education resources", 
              icon: <BookOpen className="w-8 h-8 text-purple-500" />,
              color: "bg-purple-100 dark:bg-purple-900/30"
            }
          ].map((value, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Company Metrics</h2>
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {companyStats.map((stat, index) => (
            <div 
              key={stat.name}
              ref={addToStatsRefs}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: `${stat.color}20`}}>
                  {index === 0 && <Users className="w-6 h-6" style={{color: stat.color}} />}
                  {index === 1 && <Globe className="w-6 h-6" style={{color: stat.color}} />}
                  {index === 2 && <Target className="w-6 h-6" style={{color: stat.color}} />}
                  {index === 3 && <Award className="w-6 h-6" style={{color: stat.color}} />}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-600 dark:text-gray-400">{stat.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold value-display">0</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">
                      {index === 0 ? ' users' : index === 1 || index === 2 || index === 3 ? '%' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stat.increase}% growth</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Our Team Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={teamGrowthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151',
                    color: '#e5e7eb' 
                  }} 
                />
                <Legend />
                <Bar dataKey="employees" name="Team Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Market Coverage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketCoverageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {marketCoverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Coverage']}
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
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Khush Mevada', role: 'Founder & CEO', bio: 'Visionary leader with expertise in financial markets and software development', image: '/team/placeholder.png' },
            { name: 'Priya Singh', role: 'CTO', bio: 'Technology expert specializing in data analytics and machine learning', image: '/team/placeholder.png' },
            { name: 'Rahul Sharma', role: 'Head of Analytics', bio: 'Financial analyst with over 15 years of experience in Indian markets', image: '/team/placeholder.png' }
          ].map((member, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform hover:-translate-y-1"
            >
              <div className="h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-center">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-center mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Technology</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cutting-Edge Stack</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              "Next.js Frontend Framework",
              "Real-time Data Processing",
              "Advanced Chart Visualization",
              "Machine Learning Predictions",
              "Custom Technical Indicators",
              "Secure User Authentication",
              "Cloud-based Infrastructure",
              "Mobile-Responsive Design",
              "API Integration with Exchanges"
            ].map((tech, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-800 dark:text-gray-200">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </div>
  );
}
