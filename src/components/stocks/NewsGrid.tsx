import React from 'react';
import NewsCard from './NewsCard';

interface NewsItem {
  id?: string;
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
  // Additional fields available in our API response
  listimage?: string;
  smallimage?: string;
  image_621x414?: string;
  image_222x148?: string;
}

interface NewsGridProps {
  newsItems: NewsItem[];
  title?: string;
  maxItems?: number;
  viewMoreUrl?: string;
}

const NewsGrid: React.FC<NewsGridProps> = ({ 
  newsItems, 
  title = "Latest News", 
  maxItems = 6,
  viewMoreUrl
}) => {
  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="rounded-lg p-6 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <p className="text-gray-400">No news items available at the moment.</p>
      </div>
    );
  }

  const displayedItems = newsItems.slice(0, maxItems);

  return (
    <div className="rounded-lg p-6 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => (
          <NewsCard
            key={item.id || `news-${index}`}
            headline={item.headline}
            intro={item.intro}
            date={item.date}
            url={item.url}
            section={item.section}
            timeToRead={item.timeToRead}
            thumbnailimage={item.thumbnailimage}
            bigimage={item.bigimage || item.image_621x414}
            byline={item.byline}
            premiumStory={item.premiumStory}
            imagecaption={item.imagecaption}
          />
        ))}
      </div>
      
      {viewMoreUrl && newsItems.length > maxItems && (
        <div className="mt-6 text-center">
          <a 
            href={viewMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            View More News
          </a>
        </div>
      )}
    </div>
  );
};

export default NewsGrid;
