import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Briefcase, Award } from 'lucide-react';

interface OfficerTitle {
  Value: string;
  iD1?: string;
  abbr1?: string;
  iD2?: string;
  abbr2?: string;
}

interface Officer {
  name?: string;
  firstName?: string;
  lastName?: string;
  title?: string | OfficerTitle;
  since?: string;
  rank?: number;
  startYear?: string;
  startMonth?: string;
  startDay?: string;
  [key: string]: any;
}

interface ManagementInfoProps {
  officers: Officer[];
}

const ManagementInfo: React.FC<ManagementInfoProps> = ({ officers }) => {
  if (!officers || officers.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Management Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Management information not available</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to extract officer name
  const getOfficerName = (officer: Officer): string => {
    if (officer.name) {
      return officer.name;
    }
    
    if (officer.firstName && officer.lastName) {
      return `${officer.firstName} ${officer.lastName}`;
    }
    
    return 'Unknown';
  };

  // Helper to extract officer title
  const getOfficerTitle = (officer: Officer): string => {
    if (typeof officer.title === 'string') {
      return officer.title;
    }
    
    if (typeof officer.title === 'object' && officer.title?.Value) {
      return officer.title.Value;
    }
    
    return 'Unknown Position';
  };

  // Helper to extract start date
  const getStartDate = (officer: Officer): string => {
    if (officer.since) {
      return officer.since;
    }
    
    if (officer.startYear) {
      const month = officer.startMonth || '01';
      const day = officer.startDay || '01';
      return `${officer.startYear}-${month}-${day}`;
    }
    
    return '';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          Management Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {officers.slice(0, 5).map((officer, index) => {
            const name = getOfficerName(officer);
            const title = getOfficerTitle(officer);
            const startDate = getStartDate(officer);
            
            return (
              <div key={index} className="flex items-start">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-indigo-400 text-lg font-bold">
                    {name.substring(0, 1)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{name}</h3>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-gray-400 text-sm">{title}</p>
                  </div>
                  {startDate && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Since {formatDate(startDate)}</span>
                    </div>
                  )}
                  {officer.education && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      <span>{officer.education}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {officers.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All {officers.length} Management Members
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagementInfo; 