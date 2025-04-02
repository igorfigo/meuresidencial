
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VpsStatusBadgeProps {
  status: string;
}

export function VpsStatusBadge({ status }: VpsStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-500 hover:bg-green-600';
      case 'stopped':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'rebooting':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = () => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'pending':
        return 'Pending';
      case 'rebooting':
        return 'Rebooting';
      default:
        return status;
    }
  };

  return (
    <Badge variant="secondary" className={cn('text-white', getStatusColor())}>
      {getStatusLabel()}
    </Badge>
  );
}
