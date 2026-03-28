export interface NewsItem {
  id: string | number;
  title: string;
  source: string;
  date: string;
  url: string;
  imageUrl?: string | null;
  image_url?: string | null;
  summary?: string;
  category?: string;
}
