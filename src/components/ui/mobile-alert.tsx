
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}

export function MobileAlert({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  destructive = false,
}: MobileAlertProps) {
  const isMobile = useIsMobile();
  
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={isMobile ? 'w-[calc(100%-2rem)] p-4 max-w-md' : ''}>
        <AlertDialogHeader>
          <AlertDialogTitle className={isMobile ? 'text-lg' : ''}>{title}</AlertDialogTitle>
          <AlertDialogDescription className={isMobile ? 'text-sm' : ''}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isMobile ? 'flex-col space-y-2 sm:space-y-0 mt-3' : ''}>
          <AlertDialogCancel 
            className={isMobile ? 'w-full mt-0 sm:mt-0' : ''}
            onClick={onClose}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            className={`${isMobile ? 'w-full' : ''} ${destructive ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
