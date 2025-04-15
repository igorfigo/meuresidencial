
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultTermsConditions } from '@/utils/defaultTermsConditions';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type TermsConditions = Tables<'terms_conditions'>;

export function useTerms() {
  const queryClient = useQueryClient();

  const { data: terms, isLoading, error } = useQuery({
    queryKey: ['terms-conditions'],
    queryFn: async () => {
      try {
        // First, try to fetch the latest terms and conditions
        const { data, error } = await supabase
          .from('terms_conditions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching terms:", error);
          
          // If no terms exist, create default terms
          const { data: insertedData, error: insertError } = await supabase
            .from('terms_conditions')
            .insert({ content: defaultTermsConditions })
            .select()
            .single();
            
          if (insertError) {
            console.error("Error creating default terms:", insertError);
            // Return fallback if insertion fails
            return { content: defaultTermsConditions, id: 'default', created_at: new Date().toISOString() } as TermsConditions;
          }
          
          return insertedData;
        }

        return data;
      } catch (err) {
        console.error("Exception in terms query:", err);
        return { content: defaultTermsConditions, id: 'default', created_at: new Date().toISOString() } as TermsConditions;
      }
    },
  });

  const updateTerms = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('terms_conditions')
        .insert({ content })
        .select()
        .single();
        
      if (error) {
        console.error("Error updating terms:", error);
        throw new Error('Erro ao atualizar os termos e condições');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-conditions'] });
      toast.success('Termos e condições atualizados com sucesso!');
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  return {
    terms,
    isLoading,
    error,
    updateTerms,
  };
}
