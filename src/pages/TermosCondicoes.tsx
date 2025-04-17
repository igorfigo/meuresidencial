
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useTerms } from '@/hooks/use-terms';
import { toast } from 'sonner';

const TermosCondicoes = () => {
  const { user } = useApp();
  const [editMode, setEditMode] = React.useState(false);
  const [termsContent, setTermsContent] = React.useState('');
  
  const { terms, isLoading, updateTerms } = useTerms();

  React.useEffect(() => {
    if (terms?.content) {
      setTermsContent(terms.content);
    }
  }, [terms]);

  const handleSave = () => {
    if (termsContent.trim()) {
      updateTerms.mutate(termsContent, {
        onSuccess: () => setEditMode(false)
      });
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
            <Button onClick={handleSave} disabled={updateTerms.isPending}>
              {updateTerms.isPending ? 'Salvando...' : 'Salvar'}
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
