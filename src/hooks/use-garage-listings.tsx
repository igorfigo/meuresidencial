
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

export interface GarageListing {
  id: string;
  resident_id: string;
  matricula: string;
  is_available: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Join data from residents
  residents?: {
    nome_completo: string;
    unidade: string;
    telefone: string | null;
    email: string | null;
  };
}

export const useGarageListings = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get all garage listings for the condominium
  const { data: garageListings, isLoading: isLoadingListings } = useQuery({
    queryKey: ['garageListings', user?.matricula],
    queryFn: async (): Promise<GarageListing[]> => {
      if (!user?.matricula) return [];

      const { data, error } = await supabase
        .from('garage_listings')
        .select(`
          *,
          residents (
            nome_completo,
            unidade,
            telefone,
            email
          )
        `)
        .eq('matricula', user.matricula)
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching garage listings:', error);
        toast.error('Erro ao carregar vagas de garagem');
        return [];
      }

      return data || [];
    },
    enabled: !!user?.matricula,
  });

  // Get resident's own garage listings
  const { data: myGarageListings, isLoading: isLoadingMyListings } = useQuery({
    queryKey: ['myGarageListings', user?.residentId],
    queryFn: async (): Promise<GarageListing[]> => {
      if (!user?.residentId) return [];

      const { data, error } = await supabase
        .from('garage_listings')
        .select('*')
        .eq('resident_id', user.residentId);

      if (error) {
        console.error('Error fetching my garage listings:', error);
        toast.error('Erro ao carregar minhas vagas de garagem');
        return [];
      }

      return data || [];
    },
    enabled: !!user?.residentId,
  });

  // Add a new garage listing
  const addGarageListing = useMutation({
    mutationFn: async (description: string) => {
      if (!user?.residentId || !user?.matricula) {
        throw new Error('Usuário não identificado');
      }

      setIsLoading(true);
      
      console.log('Adding garage listing with data:', {
        resident_id: user.residentId,
        matricula: user.matricula,
        description
      });
      
      const { data, error } = await supabase
        .from('garage_listings')
        .insert({
          resident_id: user.residentId,
          matricula: user.matricula,
          description,
          is_available: true
        })
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      // After successful insertion, create a notification using a custom RPC function
      try {
        // Using a direct fetch call instead of supabase.rpc() to avoid type issues
        const response = await fetch(`https://kcbvdcacgbwigefwacrk.supabase.co/rest/v1/rpc/notify_new_garage_listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYnZkY2FjZ2J3aWdlZndhY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjgzMDQsImV4cCI6MjA1NzgwNDMwNH0.K4xcW6V3X9QROQLekB74NbKg3BaShwgMbanrP3olCYI',
            'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`
          },
          body: JSON.stringify({
            p_matricula: user.matricula,
            p_title: 'Nova vaga de garagem disponível',
            p_message: `${user.nome} disponibilizou uma vaga de garagem`
          })
        });
        
        if (!response.ok) {
          console.error('Error sending notification:', await response.text());
        }
      } catch (notifyError) {
        console.error('Exception sending notification:', notifyError);
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Vaga de garagem cadastrada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['myGarageListings'] });
      queryClient.invalidateQueries({ queryKey: ['garageListings'] });
    },
    onError: (error) => {
      console.error('Error adding garage listing:', error);
      toast.error('Erro ao cadastrar vaga de garagem');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Toggle availability of a garage listing - keeping implementation but not exporting
  const toggleGarageListingAvailability = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('garage_listings')
        .update({ is_available: isAvailable })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isAvailable 
          ? 'Vaga marcada como disponível' 
          : 'Vaga marcada como indisponível'
      );
      queryClient.invalidateQueries({ queryKey: ['myGarageListings'] });
      queryClient.invalidateQueries({ queryKey: ['garageListings'] });
    },
    onError: (error) => {
      console.error('Error toggling garage listing availability:', error);
      toast.error('Erro ao atualizar disponibilidade da vaga');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Delete a garage listing
  const deleteGarageListing = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('garage_listings')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      toast.success('Vaga de garagem removida com sucesso');
      queryClient.invalidateQueries({ queryKey: ['myGarageListings'] });
      queryClient.invalidateQueries({ queryKey: ['garageListings'] });
    },
    onError: (error) => {
      console.error('Error deleting garage listing:', error);
      toast.error('Erro ao remover vaga de garagem');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  return {
    garageListings,
    myGarageListings,
    isLoading: isLoading || isLoadingListings || isLoadingMyListings,
    addGarageListing,
    deleteGarageListing
  };
};
