
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const TermosCondicoes = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = React.useState(false);
  const [termsContent, setTermsContent] = React.useState('');
  
  const { data: terms, isLoading } = useQuery({
    queryKey: ['terms-conditions'],
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

  React.useEffect(() => {
    if (terms?.content) {
      setTermsContent(terms.content);
    }
  }, [terms]);

  const updateTermsMutation = useMutation({
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
      setEditMode(false);
      toast.success('Termos e condições atualizados com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const handleSave = () => {
    if (termsContent.trim()) {
      updateTermsMutation.mutate(termsContent);
    } else {
      toast.error('O conteúdo dos termos não pode estar vazio.');
    }
  };

  const handleCancel = () => {
    setTermsContent(terms?.content || '');
    setEditMode(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
      );
    }

    if (editMode) {
      return (
        <div className="space-y-4">
          <Textarea
            value={termsContent}
            onChange={(e) => setTermsContent(e.target.value)}
            className="min-h-[500px] text-sm"
            placeholder="Digite os termos e condições aqui..."
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={updateTermsMutation.isPending}>
              {updateTermsMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          {terms?.content ? (
            <div className="whitespace-pre-wrap">{terms.content}</div>
          ) : (
            <p className="text-muted-foreground">Nenhum termo ou condição definido.</p>
          )}
        </div>
        {user?.isAdmin && (
          <Button onClick={() => setEditMode(true)}>Editar Termos e Condições</Button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Termos e Condições</CardTitle>
            <CardDescription>
              Termos e condições de uso da plataforma Meu Residencial
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TermosCondicoes;
