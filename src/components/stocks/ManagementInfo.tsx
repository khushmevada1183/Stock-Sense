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
  education?: string;
  since?: string;
  rank?: number;
  startYear?: string;
  startMonth?: string;
  startDay?: string;
  [key: string]: unknown;
}

interface ManagementInfoProps {
  officers: Officer[];
}

const ManagementInfo: React.FC<ManagementInfoProps> = ({ officers }) => {
  if (!officers || officers.length === 0) {
    return (
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-neon-400" />
            Management Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Management information not available</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to extract officer name
  const getOfficerName = (officer: Officer): string => {
    if (officer.name) return officer.name;
    if (officer.firstName && officer.lastName) return `${officer.firstName} ${officer.lastName}`;
    return 'Unknown';
  };

  // Helper to extract officer title
  const getOfficerTitle = (officer: Officer): string => {
    if (typeof officer.title === 'string') return officer.title;
    if (typeof officer.title === 'object' && officer.title?.Value) return officer.title.Value;
    return 'Unknown Position';
  };

  // Helper to extract start date
  const getStartDate = (officer: Officer): string => {
    if (officer.since) return officer.since;
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
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-neon-400" />
          Management Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {officers.slice(0, 5).map((officer, index) => {
            const name = getOfficerName(officer);
            const title = getOfficerTitle(officer);
            const startDate = getStartDate(officer);
            
            return (
              <div key={index} className="flex items-start group">
                <div className="w-11 h-11 bg-neon-400/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-neon-400/10 group-hover:border-neon-400/20 transition-colors">
                  <span className="text-neon-400 text-base font-bold">
                    {name.substring(0, 1)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-200 font-medium text-sm">{name}</h3>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-3.5 w-3.5 text-gray-600 mr-1.5 flex-shrink-0" />
                    <p className="text-gray-500 text-xs truncate">{title}</p>
                  </div>
                  {startDate && (
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Since {formatDate(startDate)}</span>
                    </div>
                  )}
                  {officer.education && (
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <Award className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{officer.education}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {officers.length > 5 && (
          <div className="mt-5 text-center">
            <button className="text-sm text-neon-400 hover:text-neon-300 transition-colors">
              View All {officers.length} Management Members
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagementInfo;