import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialMetricProps {
  label: string;
  value: string | number;
  change?: number;
  previousValue?: string | number;
  isPercentage?: boolean;
  isCurrency?: boolean;
  isPositiveGood?: boolean;
}

const FinancialMetric: React.FC<FinancialMetricProps> = ({
  label,
  value,
  change,
  previousValue,
  isPercentage = false,
  isCurrency = false,
  isPositiveGood = true
}) => {
  // Determine if change is positive or negative
  const hasChange = change !== undefined && change !== null;
  const isPositiveChange = hasChange ? change > 0 : null;
  
  // Format value based on type
  const formatValue = (val: string | number) => {
    if (val === undefined || val === null) return 'N/A';
    
    if (typeof val === 'number') {
      if (isPercentage) {
        return `${val.toFixed(2)}%`;
      } else if (isCurrency) {
        return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
    }
    
    return val;
  };

  // Set color based on change direction and whether positive is good
  const getChangeColor = () => {
    if (!hasChange) return 'text-gray-400';
    
    if (isPositiveGood) {
      return isPositiveChange ? 'text-green-400' : 'text-red-400';
    } else {
      return isPositiveChange ? 'text-red-400' : 'text-green-400';
    }
  };

  const getChangeIcon = () => {
    if (!hasChange) return <Minus className="h-4 w-4" />;
    
    if (isPositiveChange) {
      return <TrendingUp className="h-4 w-4" />;
    } else {
      return <TrendingDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 glass-card rounded-xl border border-gray-800/30">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-semibold text-white">{formatValue(value)}</div>
      
      {hasChange && (
        <div className={`flex items-center mt-2 ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="ml-1 text-sm">
            {change > 0 ? '+' : ''}{formatValue(change)}
            {previousValue ? ` from ${formatValue(previousValue)}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

interface FinancialMetricsGridProps {
  metrics: FinancialMetricProps[];
  title?: string;
}

const FinancialMetricsGrid: React.FC<FinancialMetricsGridProps> = ({ 
  metrics, 
  title = "Financial Metrics" 
}) => {
  if (!metrics || metrics.length === 0) {
    return (
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No financial metrics available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <FinancialMetric
              key={`metric-${index}`}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              previousValue={metric.previousValue}
              isPercentage={metric.isPercentage}
              isCurrency={metric.isCurrency}
              isPositiveGood={metric.isPositiveGood}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialMetricsGrid;
