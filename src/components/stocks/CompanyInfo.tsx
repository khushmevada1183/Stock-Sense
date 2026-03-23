import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, Phone, Mail, MapPin, Info, Calendar, Users, BarChart } from 'lucide-react';

interface CompanyInfoProps {
  name: string;
  symbol: string;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  ceo?: string;
  employees?: number | string;
  foundedYear?: number | string;
  marketCap?: number | string;
  stockExchange?: string;
  isin?: string;
  bseCode?: string;
  nseCode?: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  name,
  symbol,
  sector,
  industry,
  description,
  website,
  address,
  phone,
  email,
  ceo,
  employees,
  foundedYear,
  marketCap,
  stockExchange,
  isin,
  bseCode,
  nseCode
}) => {
  // Format market cap for display
  const formatMarketCap = (value: number | string | undefined) => {
    if (!value) return 'N/A';
    
    if (typeof value === 'number') {
      if (value >= 1e12) {
        return `₹${(value / 1e12).toFixed(2)} T`;
      } else if (value >= 1e9) {
        return `₹${(value / 1e9).toFixed(2)} B`;
      } else if (value >= 1e7) {
        return `₹${(value / 1e7).toFixed(2)} Cr`;
      } else if (value >= 1e5) {
        return `₹${(value / 1e5).toFixed(2)} L`;
      } else {
        return `₹${value.toLocaleString('en-IN')}`;
      }
    }
    
    return value;
  };

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Building2 className="mr-2 h-5 w-5" />
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              {name} <span className="text-gray-400 ml-2 text-sm">({symbol})</span>
            </h2>
            
            {(sector || industry) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sector && (
                  <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded">
                    {sector}
                  </span>
                )}
                {industry && (
                  <span className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded">
                    {industry}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {description && (
            <div>
              <h3 className="text-sm text-gray-400 flex items-center mb-1">
                <Info className="mr-2 h-4 w-4" />
                Description
              </h3>
              <p className="text-gray-300 text-sm">{description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {website && (
                <div className="flex items-start">
                  <Globe className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Website</div>
                    <a href={website} target="_blank" rel="noopener noreferrer" 
                       className="text-neon-400 hover:text-neon-300 transition-colors">
                      {website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
              
              {address && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-gray-300">{address}</div>
                  </div>
                </div>
              )}
              
              {phone && (
                <div className="flex items-start">
                  <Phone className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-gray-300">{phone}</div>
                  </div>
                </div>
              )}
              
              {email && (
                <div className="flex items-start">
                  <Mail className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <a href={`mailto:${email}`} className="text-neon-400 hover:text-neon-300 transition-colors">
                      {email}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {ceo && (
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">CEO</div>
                    <div className="text-gray-300">{ceo}</div>
                  </div>
                </div>
              )}
              
              {employees && (
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Employees</div>
                    <div className="text-gray-300">{typeof employees === 'number' ? employees.toLocaleString() : employees}</div>
                  </div>
                </div>
              )}
              
              {foundedYear && (
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Founded</div>
                    <div className="text-gray-300">{foundedYear}</div>
                  </div>
                </div>
              )}
              
              {marketCap && (
                <div className="flex items-start">
                  <BarChart className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Market Cap</div>
                    <div className="text-gray-300">{formatMarketCap(marketCap)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Stock exchange and identifiers */}
          <div className="pt-4 border-t border-gray-800/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stockExchange && (
                <div>
                  <div className="text-xs text-gray-500">Stock Exchange</div>
                  <div className="text-gray-300">{stockExchange}</div>
                </div>
              )}
              
              {isin && (
                <div>
                  <div className="text-xs text-gray-500">ISIN</div>
                  <div className="text-gray-300">{isin}</div>
                </div>
              )}
              
              {bseCode && (
                <div>
                  <div className="text-xs text-gray-500">BSE Code</div>
                  <div className="text-gray-300">{bseCode}</div>
                </div>
              )}
              
              {nseCode && (
                <div>
                  <div className="text-xs text-gray-500">NSE Code</div>
                  <div className="text-gray-300">{nseCode}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfo;
