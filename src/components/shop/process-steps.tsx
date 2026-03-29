'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProcessStepsProps {
  steps?: Step[];
  title?: string;
  subtitle?: string;
}

const defaultSteps: Step[] = [
  {
    number: 1,
    title: 'Consulenza',
    description: 'Analizzimo le vostre esigenze e vi proponiamo le soluzioni più adatte al vostro business.',
  },
  {
    number: 2,
    title: 'Preventivo',
    description: 'Ricevete un preventivo personalizzato senza impegno, con condizioni vantaggiose.',
  },
  {
    number: 3,
    title: 'Installazione',
    description: 'Il nostro team installa e configura tutto per voi. Consegna e montaggio gratuiti.',
  },
  {
    number: 4,
    title: 'Assistenza',
    description: 'Supporto tecnico dedicato 24h. Manutenzione, ricambi e assistenza inclusi.',
  },
];

export function ProcessSteps({
  steps = defaultSteps,
  title = 'Come iniziare è semplice',
  subtitle = 'Quattro semplici passi per accedere ai nostri servizi',
}: ProcessStepsProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative"
              onMouseEnter={() => setHoveredStep(step.number)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[calc(50%+40px)] right-[calc(-100%+20px)] h-1 bg-gradient-to-r from-blue via-blue to-transparent opacity-30" />
              )}

              {/* Step card */}
              <div
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col ${
                  hoveredStep === step.number
                    ? 'border-blue bg-white shadow-xl scale-105'
                    : 'border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-lg'
                }`}
              >
                {/* Number with animation */}
                <div
                  className={`mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full font-heading font-bold text-xl transition-all duration-300 ${
                    hoveredStep === step.number
                      ? 'bg-blue text-white scale-110'
                      : 'bg-blue-100 text-blue'
                  }`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="font-heading text-xl font-bold text-navy mb-3 flex items-center gap-2">
                  {step.title}
                  {hoveredStep === step.number && (
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  )}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  {step.description}
                </p>

                {/* Accent line */}
                <div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue to-blue-light rounded-full transition-all duration-300 ${
                    hoveredStep === step.number ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile connectors */}
        <div className="md:hidden mt-12 space-y-4 flex flex-col items-center">
          {steps.map((step, index) =>
            index < steps.length - 1 ? (
              <div
                key={`connector-${index}`}
                className="h-8 w-1 bg-gradient-to-b from-blue to-blue-light rounded-full"
              />
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
