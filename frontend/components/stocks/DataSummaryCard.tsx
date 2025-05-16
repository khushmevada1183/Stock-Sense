import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ArrowUp, 
  BarChart4, 
  Scale, 
  Percent, 
  DollarSign 
} from 'lucide-react';

interface DataSummaryCardProps {
  title: string;
  description?: string;
  metrics: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    highlight?: boolean;
    isPositive?: boolean;
    isPercentage?: boolean;
    isCurrency?: boolean;
    isLarge?: boolean;
  }[];
}

// Default icons for common metrics
const defaultIcons = {
  marketCap: <BarChart4 className="h-5 w-5" />,
  pe: <Scale className="h-5 w-5" />,
  eps: <DollarSign className="h-5 w-5" />,
  dividendYield: <Percent className="h-5 w-5" />,
  volume: <ArrowUp className="h-5 w-5" />
};

const DataSummaryCard: React.FC<DataSummaryCardProps> = ({ 
  title,
  description,
  metrics
}) => {
  // Create columns based on number of metrics
  const columns = metrics.length > 6 ? 3 : (metrics.length > 3 ? 2 : 1);
  
  // Helper to format the value
  const formatValue = (metric: { 
    value: string | number, 
    isPercentage?: boolean, 
    isCurrency?: boolean 
  }) => {
    // Handle string values
    if (typeof metric.value === 'string') {
      return metric.value;
    }
    
    // Format number with commas
    const formattedNumber = metric.value.toLocaleString('en-IN', {
      maximumFractionDigits: 2
    });
    
    // Add currency symbol or percentage as needed
    if (metric.isCurrency) {
      return `₹${formattedNumber}`;
    } else if (metric.isPercentage) {
      return `${formattedNumber}%`;
    }
    
    return formattedNumber;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={`flex ${metric.isLarge ? 'flex-col items-start' : 'items-center'} p-3 rounded-lg ${
                metric.highlight ? 'bg-gray-50 dark:bg-gray-800' : ''
              }`}
            >
              {metric.icon && (
                <div className={`
                  flex-shrink-0 p-2 rounded-full mr-3
                  ${metric.isPositive !== undefined 
                    ? (metric.isPositive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400')
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {metric.icon}
                </div>
              )}
              <div>
                <p className={`text-gray-500 dark:text-gray-400 ${metric.isLarge ? 'text-base mb-1' : 'text-sm'}`}>
                  {metric.label}
                </p>
                <p className={`
                  font-medium
                  ${metric.isLarge ? 'text-xl' : 'text-base'}
                  ${metric.isPositive !== undefined
                    ? (metric.isPositive
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-red-600 dark:text-red-500')
                    : ''}
                `}>
                  {formatValue(metric)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Export the default icons for use in other components
export { defaultIcons };
export default DataSummaryCard; 