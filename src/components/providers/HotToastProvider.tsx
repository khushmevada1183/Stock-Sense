'use client';

import { Toaster } from 'react-hot-toast';

export default function HotToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        top: 14,
        right: 14,
      }}
    />
  );
}