
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultTermsConditions } from '@/utils/defaultTermsConditions';
import { toast } from 'sonner';

export interface TermsConditions {
  id: string;
  content: string;
  created_at: string;
}

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
        .limit(1);

      if (error) {
        console.error("Error fetching terms:", error);
        return null;
      }

      // If no terms exist, create default terms
      if (!data || data.length === 0) {
        console.log("No terms found, creating default terms");
        
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('terms_conditions')
            .insert([{ content: defaultTermsConditions }])
            .select();
            
          if (insertError) {
            console.error("Error creating default terms:", insertError);
            return { content: defaultTermsConditions };
          }
          
          return insertedData[0];
        } catch (err) {
          console.error("Exception creating default terms:", err);
          return { content: defaultTermsConditions };
        }
      }
      
      return data[0];
    },
  });

  const updateTerms = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('terms_conditions')
        .insert([{ content }])
        .select();
        
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
