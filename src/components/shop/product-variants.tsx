'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Variant {
  id: number;
  code: string;
  name: string;
  imageUrl?: string;
  colorHex?: string;
  variantLabel?: string;
}

interface ProductVariantsProps {
  variants: Variant[];
  currentProductCode: string;
}

export function ProductVariants({ variants, currentProductCode }: ProductVariantsProps) {
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null);

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-4">Colori disponibili</h3>
      <div className="flex flex-wrap gap-4">
        {variants.map((variant) => {
          const isActive = variant.code === currentProductCode;
          const colorHex = variant.colorHex || '#cccccc';

          return (
            <div key={variant.code} className="relative">
              <Link
                href={`/prodotto/${variant.code}`}
                className="relative group"
                onMouseEnter={() => setHoveredVariant(variant.code)}
                onMouseLeave={() => setHoveredVariant(null)}
              >
                {/* Color swatch circle */}
                <div
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'border-navy shadow-lg ring-2 ring-navy ring-offset-2'
                      : 'border-gray-300 hover:border-navy hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: colorHex,
                  }}
                  title={variant.variantLabel || variant.name}
                >
                  {/* Show checkmark for active variant */}
                  {isActive && (
                    <span className="text-white font-bold text-lg">✓</span>
                  )}
                </div>

                {/* Tooltip on hover */}
                {hoveredVariant === variant.code && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {variant.variantLabel || variant.name}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
