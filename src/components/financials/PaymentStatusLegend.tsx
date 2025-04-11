
import React from 'react';

interface PaymentStatusLegendProps {
  compact?: boolean;
  className?: string;
}

export const PaymentStatusLegend: React.FC<PaymentStatusLegendProps> = ({ compact = false, className = "" }) => {
  return (
    <div className={`flex ${compact ? 'gap-2' : 'gap-4'} justify-center my-2 ${className}`}>
      <div className="flex items-center">
        <div className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />
        <span className="text-xs">Pago</span>
      </div>
      <div className="flex items-center">
        <div className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />
        <span className="text-xs">Pendente</span>
      </div>
      <div className="flex items-center">
        <div className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1" />
        <span className="text-xs">Em atraso</span>
      </div>
    </div>
  );
};
