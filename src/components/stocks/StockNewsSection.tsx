import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Newspaper } from 'lucide-react';

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
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-neon-400" />
            Recent News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No recent news available for this stock.</p>
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const parts = dateString.split(',');
      if (parts.length > 1) return parts.slice(1).join(',').trim();
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-neon-400" />
          Recent News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 max-h-[500px] overflow-y-auto pr-2">
          {news.slice(0, 5).map((item) => (
            <div key={item.id} className="border-b border-gray-800/30 py-4 first:pt-0 last:border-0 last:pb-0">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="flex items-start gap-3">
                  {item.thumbnailimage && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.thumbnailimage} 
                        alt={item.headline} 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-800/30"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-200 group-hover:text-neon-400 transition-colors flex items-center text-sm">
                      <span className="line-clamp-2">{item.headline}</span>
                      <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.intro}</p>
                    <div className="flex items-center text-xs text-gray-600 mt-2">
                      <span>{formatDate(item.date)}</span>
                      {item.timeToRead && (
                        <>
                          <span className="mx-2 text-gray-700">•</span>
                          <span>{item.timeToRead} min read</span>
                        </>
                      )}
                      {item.section && (
                        <>
                          <span className="mx-2 text-gray-700">•</span>
                          <span className="text-neon-400/60">{item.section}</span>
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
            className="flex items-center justify-center mt-5 text-neon-400 hover:text-neon-300 transition-colors text-sm"
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