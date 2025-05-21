import React from 'react';
import { Users, Calendar } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface Officer {
  firstName: string;
  mI?: string;
  lastName: string;
  title: {
    Value: string;
    iD1?: string;
    abbr1?: string;
    iD2?: string;
    abbr2?: string;
  };
  since?: string;
  rank?: number;
}

export interface ManagementTeamSectionProps {
  officers: Officer[];
}

const OfficerCard = ({ officer }: { officer: Officer }) => {
  // Format the full name
  const fullName = [
    officer.firstName,
    officer.mI,
    officer.lastName
  ].filter(Boolean).join(' ');
  
  // Format the date (assuming MM/DD/YYYY format)
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-12 w-12 flex items-center justify-center mr-3">
          <span className="font-medium text-lg">
            {fullName.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold">{fullName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{officer.title.Value}</p>
        </div>
      </div>
      
      {officer.since && (
        <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Since {formatDate(officer.since)}</span>
        </div>
      )}
      
      {(officer.title.abbr1 || officer.title.abbr2) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {officer.title.abbr1 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
              {officer.title.abbr1}
            </span>
          )}
          {officer.title.abbr2 && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
              {officer.title.abbr2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ManagementTeamSection = ({ officers }: ManagementTeamSectionProps) => {
  // Sort officers by rank if available
  const sortedOfficers = [...officers].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return 0;
  });
  
  const [visibleOfficers, setVisibleOfficers] = React.useState(3);
  const hasMoreOfficers = officers.length > visibleOfficers;
  
  const showMoreOfficers = () => {
    setVisibleOfficers(Math.min(visibleOfficers + 3, officers.length));
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Key Management Team
        </CardTitle>
        <CardDescription>Leadership and executives</CardDescription>
      </CardHeader>
      <CardContent>
        {officers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {sortedOfficers.slice(0, visibleOfficers).map((officer, index) => (
                <OfficerCard key={`${officer.firstName}-${officer.lastName}-${index}`} officer={officer} />
              ))}
            </div>
            
            {hasMoreOfficers && (
              <button 
                onClick={showMoreOfficers}
                className="w-full py-2 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                View More Management
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Management information not available
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagementTeamSection;
export type { Officer }; 