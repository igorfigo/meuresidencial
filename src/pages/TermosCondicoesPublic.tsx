
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const TermosCondicoesPublic = () => {
  const { data: terms, isLoading } = useQuery({
    queryKey: ['terms-conditions-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms_conditions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching terms:', error);
        return { content: 'Termos e condições não encontrados.' };
      }
      
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Termos e Condições</CardTitle>
                  <CardDescription>
                    Meu Residencial - Gestão de Condomínios
                  </CardDescription>
                </div>
                <a href="/" className="text-sm text-blue-500 hover:underline">
                  Voltar para página inicial
                </a>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    {terms?.content ? (
                      <div className="whitespace-pre-wrap">{terms.content}</div>
                    ) : (
                      <p className="text-muted-foreground">Nenhum termo ou condição definido.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermosCondicoesPublic;
