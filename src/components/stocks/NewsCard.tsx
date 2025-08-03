import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NewsItemProps {
  headline: string;
  intro: string;
  date: string;
  url: string;
  section: string;
  timeToRead: string;
  thumbnailimage?: string;
  bigimage?: string;
  byline?: string;
  premiumStory?: string;
  imagecaption?: string;
}

const NewsCard: React.FC<NewsItemProps> = ({
  headline,
  intro,
  date,
  url,
  section,
  timeToRead,
  thumbnailimage,
  bigimage,
  byline,
  premiumStory,
  imagecaption
}) => {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
      {bigimage && (
        <div className="relative w-full h-40 overflow-hidden">
          <img 
            src={bigimage} 
            alt={headline} 
            className="w-full h-full object-cover"
          />
          {premiumStory === "true" && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
              PREMIUM
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-white text-lg line-clamp-2">
          {headline}
        </h3>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <p className="text-gray-300 line-clamp-3 text-sm">{intro}</p>
      </CardContent>
      
      <CardFooter className="pt-0 border-t border-gray-700/50 text-xs text-gray-400 flex flex-wrap items-center gap-2">
        {byline && <span>{byline}</span>}
        <span>{formatDate(date)}</span>
        {timeToRead && (
          <span className="flex items-center">
            <span className="mx-1">•</span>
            {timeToRead} min read
          </span>
        )}
        {section && (
          <span className="flex items-center">
            <span className="mx-1">•</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded">{section}</span>
          </span>
        )}
        <Link 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-auto text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          Read more
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
