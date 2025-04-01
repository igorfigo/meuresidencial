
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

interface CancelSubscriptionDialogProps {
  condominiumMatricula: string;
  userEmail: string;
}

export const CancelSubscriptionDialog = ({ condominiumMatricula, userEmail }: CancelSubscriptionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useApp();

  const handleCancelSubscription = async () => {
    if (!condominiumMatricula) return;
    
    setIsLoading(true);
    try {
      // Update the condominium record to set ativo = false
      const { error } = await supabase
        .from('condominiums')
        .update({ ativo: false })
        .eq('matricula', condominiumMatricula);
        
      if (error) {
        throw error;
      }
      
      // Log the cancellation in the condominium change logs
      await supabase.from('condominium_change_logs').insert({
        matricula: condominiumMatricula,
        campo: 'ativo',
        valor_anterior: 'true',
        valor_novo: 'false',
        usuario: userEmail
      });
      
      // Deactivate all residents for this condominium
      const { error: residentsError } = await supabase
        .from('residents')
        .update({ active: false })
        .eq('matricula', condominiumMatricula);
        
      if (residentsError) {
        console.error('Error deactivating residents:', residentsError);
        // We don't throw here to allow the subscription cancellation to complete
      }
      
      toast.success('Sua assinatura foi cancelada com sucesso');
      
      // Delay logout to allow the success toast to be visible
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura. Tente novamente ou entre em contato com o suporte.');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setIsOpen(true)}
      >
        <X className="mr-2 h-4 w-4" /> Cancelar Assinatura
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar sua assinatura? Essa ação desativará sua conta e de todos moradores.
              <p className="mt-2 font-medium text-destructive">
                Essa operação não poderá ser desfeita. Para reativar sua conta, será necessário entrar em contato com o administrador do sistema.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Não, manter assinatura</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelando...' : 'Sim, cancelar assinatura'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
