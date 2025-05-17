import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  headline: string;
  intro: string;
  date: string;
  url: string;
  section: string;
  timeToRead: string;
  thumbnailimage: string;
}

interface StockNewsSectionProps {
  news: NewsItem[];
}

const StockNewsSection: React.FC<StockNewsSectionProps> = ({ news }) => {
  if (!news || news.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No recent news available for this stock.</p>
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      // Handle format like "Mon, 12 May 2025 10:59 AM IST IST"
      const parts = dateString.split(',');
      if (parts.length > 1) {
        return parts.slice(1).join(',').trim();
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {news.slice(0, 5).map((item) => (
            <div key={item.id} className="border-b border-gray-700 pb-4 last:border-0">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex items-start gap-3">
                  {item.thumbnailimage && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.thumbnailimage} 
                        alt={item.headline} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors flex items-center">
                      {item.headline}
                      <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.intro}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{formatDate(item.date)}</span>
                      {item.timeToRead && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{item.timeToRead} min read</span>
                        </>
                      )}
                      {item.section && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{item.section}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
        {news.length > 5 && (
          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent('stock news')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            View More News
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default StockNewsSection; 