'use client';

interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ children, subtitle, className = '' }: PageTitleProps) {
  return (
    <div className={className}>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy animate-slide-up">
        {children}
      </h1>
      <div className="h-[3px] bg-gradient-to-r from-blue to-blue-light rounded-full mt-2 animate-line-expand" />
      {subtitle && (
        <p className="text-sm text-gray-500 mt-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
