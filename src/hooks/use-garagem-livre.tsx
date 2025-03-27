
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

interface GaragemLivre {
  id: string;
  matricula: string;
  unidade: string;
  nome_completo: string;
  telefone: string | null;
  email: string | null;
  descricao: string;
  valor: string;
  observacoes?: string;
  created_at: string;
  resident_id: string;
}

interface CreateGaragemLivreParams {
  nome_completo: string;
  telefone: string | null;
  email: string | null;
  unidade: string;
  descricao: string;
  valor: string;
  observacoes?: string;
}

export function useGaragemLivre() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const matricula = user?.matricula;
  const residentId = user?.residentId;

  // Fetch garagens from the current user
  const { data: garagens = [], isLoading, error } = useQuery({
    queryKey: ['garagens-livre', residentId],
    queryFn: async () => {
      if (!residentId) return [];
      
      // Use casting to work around the type error
      const { data, error } = await (supabase
        .from('garagens_livre')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false }) as any);
        
      if (error) {
        console.error('Error fetching garagens:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!residentId
  });

  // Add a new garagem
  const { mutateAsync: addGaragem } = useMutation({
    mutationFn: async (garagemData: CreateGaragemLivreParams) => {
      if (!matricula || !residentId) {
        throw new Error('Usuário não identificado');
      }
      
      // Use casting to work around the type error
      const { data, error } = await (supabase
        .from('garagens_livre')
        .insert([
          {
            matricula,
            resident_id: residentId,
            unidade: garagemData.unidade,
            nome_completo: garagemData.nome_completo,
            telefone: garagemData.telefone,
            email: garagemData.email,
            descricao: garagemData.descricao,
            valor: garagemData.valor,
            observacoes: garagemData.observacoes
          }
        ])
        .select()
        .single() as any);
        
      if (error) {
        console.error('Error adding garagem:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garagens-livre', residentId] });
    }
  });

  // Delete a garagem
  const { mutateAsync: deleteGaragem } = useMutation({
    mutationFn: async (id: string) => {
      // Use casting to work around the type error
      const { error } = await (supabase
        .from('garagens_livre')
        .delete()
        .eq('id', id)
        .eq('resident_id', residentId) as any); // For security, ensure user can only delete their own listings
        
      if (error) {
        console.error('Error deleting garagem:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garagens-livre', residentId] });
    }
  });

  return {
    garagens: garagens as GaragemLivre[],
    isLoading,
    error,
    addGaragem,
    deleteGaragem
  };
}
