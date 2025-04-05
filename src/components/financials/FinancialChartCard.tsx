
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
        "overflow-hidden border-blue-300 shadow-md border-t-4 border-t-brand-600 transition-all duration-300", 
        onClick && "hover:border-blue-400 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-blue-600">{icon}</div>
          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {periodLabel && (
            <span className="ml-auto text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {periodLabel}
            </span>
          )}
        </div>
        
        <div className="px-1">
          {children}
        </div>
        
        {footerContent && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            {footerContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
