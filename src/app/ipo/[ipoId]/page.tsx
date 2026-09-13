import IpoDetailClient from './IpoDetailClient';

export function generateStaticParams() {
  return [{ ipoId: 'placeholder' }];
}

export default function IpoDetailPage() {
  return <IpoDetailClient />;
}