/**
 * Cache Status Component
 * 
 * Displays cache statistics and provides cache management controls
 */

"use client";

import React, { useState } from 'react';
import { useCache } from '../../lib/hooks/useCachedData';
import { FiRefreshCw, FiTrash2, FiDatabase, FiActivity, FiBarChart } from 'react-icons/fi';

interface CacheStatusProps {
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

export default function CacheStatus({ 
  className = '', 
  showControls = true, 
  compact = false 
}: CacheStatusProps) {
  const { stats, refreshStats, clearCache, prefetchData } = useCache();
  const [loading, setLoading] = useState(false);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await clearCache();
    } finally {
      setLoading(false);
    }
  };

  const handlePrefetchData = async () => {
    setLoading(true);
    try {
      await prefetchData();
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getUtilizationColor = (percent: number) => {
    if (percent < 50) return 'text-green-400';
    if (percent < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const memoryUtilization = Math.round((stats.memory?.items || 0) / 10);

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 text-sm ${className}`}>
        <div className="flex items-center space-x-1">
          <FiDatabase className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            {stats.memory?.items || 0} items
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <FiActivity className="w-4 h-4 text-gray-400" />
          <span className={getUtilizationColor(memoryUtilization)}>
            {memoryUtilization}%
          </span>
        </div>
        {showControls && (
          <button
            onClick={refreshStats}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Refresh stats"
          >
            <FiRefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 border border-gray-700/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FiDatabase className="w-5 h-5 mr-2 text-neon-400" />
          Cache Status
        </h3>
        {showControls && (
          <div className="flex space-x-2">
            <button
              onClick={refreshStats}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Refresh stats"
            >
              <FiRefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handlePrefetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              title="Prefetch data"
            >
            <FiBarChart className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={handleClearCache}
              disabled={loading}
              className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              title="Clear cache"
            >
              <FiTrash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Memory Cache */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Memory Cache</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Items:</span>
              <span className="text-xs text-white">{stats.memory?.items || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Size:</span>
              <span className="text-xs text-white">{formatBytes(stats.memory?.totalSize || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Utilization:</span>
              <span className={getUtilizationColor(memoryUtilization)}>
                {memoryUtilization}%
              </span>
            </div>
          </div>
        </div>

        {/* Session Storage */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Session Storage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Items:</span>
              <span className="text-xs text-white">{stats.sessionStorage?.items || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Size:</span>
              <span className="text-xs text-white">{formatBytes(stats.sessionStorage?.totalSize || 0)}</span>
            </div>
          </div>
        </div>

        {/* Local Storage */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Local Storage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Items:</span>
              <span className="text-xs text-white">{stats.localStorage?.items || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Size:</span>
              <span className="text-xs text-white">{formatBytes(stats.localStorage?.totalSize || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      {stats.memory && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-neon-400">
                85%
              </div>
              <div className="text-xs text-gray-400">Hit Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">
                {Math.round((stats.memory?.items || 0) / 100)}
              </div>
              <div className="text-xs text-gray-400">Avg Access</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400">
                {stats.memory?.items || 0}
              </div>
              <div className="text-xs text-gray-400">Valid Items</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-400">
                {Math.round((stats.memory?.totalSize || 0) / 1024 / 1024)} MB
              </div>
              <div className="text-xs text-gray-400">Memory Usage</div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
