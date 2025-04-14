
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultTermsConditions } from '@/utils/defaultTermsConditions';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type TermsConditions = Tables<'terms_conditions'>['Row'];

export function useTerms() {
  const queryClient = useQueryClient();

  const { data: terms, isLoading, error } = useQuery({
    queryKey: ['terms-conditions'],
    queryFn: async () => {
      // First, try to fetch the latest terms and conditions
      const { data, error } = await supabase
        .from('terms_conditions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching terms:", error);
        return null;
      }

      // If no terms exist, create default terms
      if (!data) {
        console.log("No terms found, creating default terms");
        
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('terms_conditions')
            .insert({ content: defaultTermsConditions })
            .select()
            .single();
            
          if (insertError) {
            console.error("Error creating default terms:", insertError);
            return { content: defaultTermsConditions };
          }
          
          return insertedData;
        } catch (err) {
          console.error("Exception creating default terms:", err);
          return { content: defaultTermsConditions };
        }
      }
      
      return data;
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
        throw new Error('Erro ao atualizar os termos e condições');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-conditions'] });
      toast.success('Termos e condições atualizados com sucesso!');
    },
    onError: (error) => {
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
