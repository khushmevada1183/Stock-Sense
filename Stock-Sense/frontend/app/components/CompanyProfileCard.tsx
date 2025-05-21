import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Briefcase, Hash } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface CompanyProfileCardProps {
  companyDescription: string;
  industry?: string;
  isin?: string;
  bseCode?: string;
  nseCode?: string;
}

const CompanyProfileCard = ({
  companyDescription,
  industry,
  isin,
  bseCode,
  nseCode
}: CompanyProfileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  // Determine if the description is long enough to warrant collapsing
  const isLongDescription = companyDescription && companyDescription.length > 300;
  const displayText = isLongDescription && !isExpanded
    ? companyDescription.substring(0, 300) + '...'
    : companyDescription;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Company Profile
        </CardTitle>
        <CardDescription>Background information and identifiers</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Company Description */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">About</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {displayText}
          </p>
          {isLongDescription && (
            <button 
              onClick={toggleExpanded}
              className="mt-2 text-blue-600 dark:text-blue-400 flex items-center text-sm font-medium hover:underline"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Read More
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Company Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {industry && (
            <div className="flex items-start">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                <p className="font-medium">{industry}</p>
              </div>
            </div>
          )}
          
          {isin && (
            <div className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ISIN</p>
                <p className="font-medium font-mono">{isin}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
              <Hash className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Exchange Codes</p>
              <div className="flex flex-col">
                {bseCode && <p className="font-medium">BSE: <span className="font-mono">{bseCode}</span></p>}
                {nseCode && <p className="font-medium">NSE: <span className="font-mono">{nseCode}</span></p>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileCard; 