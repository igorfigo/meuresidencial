
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialChartCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  tooltip?: string;
  periodLabel?: string;
  footerContent?: ReactNode;
  onClick?: () => void;
}

export const FinancialChartCard: React.FC<FinancialChartCardProps> = ({
  title,
  icon,
  children,
  className = "",
  tooltip,
  periodLabel,
  footerContent,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden border-blue-300 shadow-md border-t-4 border-t-brand-600", 
        onClick && "hover:border-blue-400 hover:shadow-lg transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-blue-500">{icon}</div>
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">{title}</h3>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {periodLabel && (
            <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {periodLabel}
            </span>
          )}
        </div>
        
        {children}
        
        {footerContent && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            {footerContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
