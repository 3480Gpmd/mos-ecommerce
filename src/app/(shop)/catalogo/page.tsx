import { Suspense } from 'react';
import { CatalogoContent } from './catalogo-content';

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 12}).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />)}</div></div>}>
      <CatalogoContent />
    </Suspense>
  );
}
