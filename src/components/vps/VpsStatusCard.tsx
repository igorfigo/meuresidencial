
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'warning' | 'normal';

interface VpsStatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  total: number;
  unit?: string;
  status: StatusType;
}

const getStatusColor = (status: StatusType) => {
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'offline':
      return 'text-red-500';
    case 'warning':
      return 'text-orange-500';
    case 'normal':
      return 'text-blue-500';
    default:
      return '';
  }
};

const getProgressColor = (status: StatusType) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'warning':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-blue-500';
    default:
      return '';
  }
};

const VpsStatusCard: React.FC<VpsStatusCardProps> = ({
  icon,
  title,
  value,
  total,
  unit = '',
  status
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const statusColor = getStatusColor(status);
  const progressColor = getProgressColor(status);

  return (
    <Card className="border-t-4 border-t-blue-600 shadow-md overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        
        <div className="flex items-end justify-between mb-1.5">
          <div className="text-2xl font-bold">
            {value}{unit}
            <span className="text-sm text-gray-500 font-normal ml-1">
              / {total}{unit}
            </span>
          </div>
          <div className={cn("text-sm font-medium", statusColor)}>
            {percentage}%
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-2 bg-gray-100" 
          indicatorClassName={progressColor}
        />
      </CardContent>
    </Card>
  );
};

export default VpsStatusCard;
