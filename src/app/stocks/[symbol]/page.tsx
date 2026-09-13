import StockDetailClient from './StockDetailClient';

export function generateStaticParams() {
  return [{ symbol: 'RELIANCE' }];
}

export default function StockDetailPage() {
  return <StockDetailClient />;
}