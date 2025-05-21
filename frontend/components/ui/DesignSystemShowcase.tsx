"use client";

import React from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, Bell, Settings, ChevronRight, Search, Zap } from 'lucide-react';

const demoData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 500 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
];

const DesignSystemShowcase = () => {
  return (
    <div className="min-h-screen dark bg-gradient-to-b from-gray-950 to-gray-900 text-white p-6 noise-bg">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight neon-glow-text">
            Stock Sense Design System
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A sophisticated dark mode aesthetic with neon green accents for the Stock Sense financial analysis platform
          </p>
        </header>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-gray-950 rounded-md"></div>
              <p className="text-sm font-medium">Rich Black (#050505)</p>
              <p className="text-xs text-gray-400">Primary Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-850 rounded-md"></div>
              <p className="text-sm font-medium">Dark Charcoal (#121212)</p>
              <p className="text-xs text-gray-400">Secondary Surfaces</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-neon-400 rounded-md"></div>
              <p className="text-sm font-medium">Neon Green (#39FF14)</p>
              <p className="text-xs text-gray-400">Primary Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-cyan-500 rounded-md"></div>
              <p className="text-sm font-medium">Cyan Blue (#00C2CB)</p>
              <p className="text-xs text-gray-400">Secondary Accent</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Typography</h2>
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-gray-400 text-sm">Inter, 36px, Bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <p className="text-gray-400 text-sm">Inter, 30px, Bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <p className="text-gray-400 text-sm">Inter, 24px, Semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Heading 4</h4>
              <p className="text-gray-400 text-sm">Inter, 20px, Semibold</p>
            </div>
            <div>
              <p className="text-base">Body Text</p>
              <p className="text-gray-400 text-sm">Inter, 16px, Regular</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Small Text / Caption</p>
              <p className="text-gray-400 text-xs">Inter, 14px, Regular</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Button */}
            <div className="space-y-2">
              <button className="px-4 py-2 bg-neon-400 text-black font-medium rounded-md hover:bg-neon-300 transition-all duration-300 hover:shadow-neon-lg">
                Primary Button
              </button>
              <p className="text-xs text-gray-400">Primary Action</p>
            </div>

            {/* Secondary Button */}
            <div className="space-y-2">
              <button className="px-4 py-2 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-400 transition-all duration-300 hover:shadow-cyan-lg">
                Secondary Button
              </button>
              <p className="text-xs text-gray-400">Secondary Action</p>
            </div>

            {/* Outline Button */}
            <div className="space-y-2">
              <button className="px-4 py-2 border border-neon-400 text-neon-400 font-medium rounded-md hover:bg-neon-400/10 transition-all duration-300 hover:shadow-neon-sm">
                Outline Button
              </button>
              <p className="text-xs text-gray-400">Tertiary Action</p>
            </div>

            {/* Ghost Button */}
            <div className="space-y-2">
              <button className="px-4 py-2 text-white font-medium rounded-md hover:bg-white/5 transition-all duration-300">
                Ghost Button
              </button>
              <p className="text-xs text-gray-400">Subtle Action</p>
            </div>

            {/* Icon Button */}
            <div className="space-y-2">
              <button className="p-2 bg-gray-850 text-neon-400 rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-neon-sm">
                <Settings size={20} />
              </button>
              <p className="text-xs text-gray-400">Icon Button</p>
            </div>

            {/* Disabled Button */}
            <div className="space-y-2">
              <button className="px-4 py-2 bg-gray-700 text-gray-400 font-medium rounded-md cursor-not-allowed opacity-60">
                Disabled Button
              </button>
              <p className="text-xs text-gray-400">Disabled State</p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Standard Card */}
            <div className="bg-gray-850 rounded-lg p-6 hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Standard Card</h3>
              <p className="text-gray-300 text-sm mb-4">Basic card component with hover effect</p>
              <div className="h-32 bg-gray-800 rounded-md mb-4"></div>
              <button className="text-neon-400 text-sm font-medium flex items-center hover:text-neon-300 transition-colors">
                View Details <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Glass Card */}
            <div className="glass rounded-lg p-6 hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
              <p className="text-gray-300 text-sm mb-4">Glass morphism effect with blur</p>
              <div className="h-32 bg-gray-800/50 rounded-md mb-4"></div>
              <button className="text-neon-400 text-sm font-medium flex items-center hover:text-neon-300 transition-colors">
                View Details <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Premium Card */}
            <div className="glass-premium rounded-lg p-6 hover:shadow-neon-sm transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Premium Card</h3>
                <span className="bg-neon-400/20 text-neon-400 text-xs px-2 py-1 rounded-full flex items-center">
                  <Zap size={12} className="mr-1" /> Premium
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-4">Premium card with neon accents</p>
              <div className="h-32 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-md mb-4"></div>
              <button className="text-neon-400 text-sm font-medium flex items-center hover:text-neon-300 transition-colors">
                View Details <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* Data Visualization */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Data Visualization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="bg-gray-850 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Line Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoData}>
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.375rem'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#39FF14" 
                      strokeWidth={2}
                      dot={{ stroke: '#39FF14', strokeWidth: 2, r: 4, fill: '#121212' }}
                      activeDot={{ stroke: '#39FF14', strokeWidth: 2, r: 6, fill: '#39FF14' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-850 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Bar Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoData}>
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.375rem'
                      }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#barGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#39FF14" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#00C2CB" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts and Status */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Alerts & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Alert */}
            <div className="flex items-center space-x-3 bg-neon-400/10 border border-neon-400/30 text-neon-400 rounded-md p-4">
              <ArrowUp className="h-5 w-5" />
              <div>
                <p className="font-medium">AAPL +2.4%</p>
                <p className="text-sm text-gray-300">Stock is up 2.4% today</p>
              </div>
            </div>

            {/* Negative Alert */}
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md p-4">
              <ArrowDown className="h-5 w-5" />
              <div>
                <p className="font-medium">TSLA -1.8%</p>
                <p className="text-sm text-gray-300">Stock is down 1.8% today</p>
              </div>
            </div>

            {/* Notification */}
            <div className="flex items-center space-x-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 rounded-md p-4">
              <Bell className="h-5 w-5" />
              <div>
                <p className="font-medium">Earnings Report</p>
                <p className="text-sm text-gray-300">MSFT earnings report is due today</p>
              </div>
            </div>

            {/* Info Alert */}
            <div className="flex items-center space-x-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-md p-4">
              <Bell className="h-5 w-5" />
              <div>
                <p className="font-medium">Market Update</p>
                <p className="text-sm text-gray-300">Market opens in 30 minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Special Effects */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Special Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gradient Border */}
            <div className="gradient-border p-6">
              <h3 className="text-lg font-semibold mb-2">Gradient Border</h3>
              <p className="text-gray-300 text-sm">Card with gradient border effect</p>
            </div>

            {/* Neon Glow */}
            <div className="bg-gray-850 rounded-lg p-6 neon-glow">
              <h3 className="text-lg font-semibold mb-2">Neon Glow</h3>
              <p className="text-gray-300 text-sm">Card with neon glow effect</p>
            </div>

            {/* Animated Gradient */}
            <div className="rounded-lg p-6 animated-gradient">
              <h3 className="text-lg font-semibold mb-2 text-black">Animated Gradient</h3>
              <p className="text-gray-900 text-sm">Card with animated gradient background</p>
            </div>

            {/* Pulsing Element */}
            <div className="bg-gray-850 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Pulsing Effect</h3>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-neon-400 rounded-full animate-pulse-neon"></span>
                <p className="text-gray-300 text-sm">Live data indicator</p>
              </div>
            </div>

            {/* Floating Element */}
            <div className="bg-gray-850 rounded-lg p-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-400 to-cyan-500 rounded-full animate-float flex items-center justify-center text-black font-bold">
                +15%
              </div>
            </div>

            {/* Glowing Element */}
            <div className="bg-gray-850 rounded-lg p-6 flex justify-center">
              <button className="px-4 py-2 bg-gray-800 text-neon-400 font-medium rounded-md border border-neon-400/50 animate-glow">
                Premium Feature
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemShowcase; 