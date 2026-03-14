import { Suspense } from 'react';
import { OrdiniContent } from './ordini-content';

export default function OrdiniPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}</div></div>}>
      <OrdiniContent />
    </Suspense>
  );
}
