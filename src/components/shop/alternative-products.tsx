'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/db/schema';
import { ProductCard } from './product-card';

interface AlternativeProductsProps {
  products: Product[];
}

export function AlternativeProducts({ products }: AlternativeProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // 4 cards with gap
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="border-t pt-8">
      <h2 className="text-lg font-bold mb-6">Prodotti Alternativi</h2>

      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-2 rounded-full bg-white border border-gray-200 hover:border-navy hover:bg-blue/5 transition-colors hidden md:flex items-center justify-center"
          aria-label="Scorri sinistra"
        >
          <ChevronLeft size={20} className="text-navy" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-4 pb-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 md:w-80"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-2 rounded-full bg-white border border-gray-200 hover:border-navy hover:bg-blue/5 transition-colors hidden md:flex items-center justify-center"
          aria-label="Scorri destra"
        >
          <ChevronRight size={20} className="text-navy" />
        </button>
      </div>

      {/* Scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
