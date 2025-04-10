
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminTools = () => {
  const { user } = useApp();
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);

  const handleGenerateBackup = async () => {
    setIsGeneratingBackup(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        toast.error('Sessão inválida. Por favor, faça login novamente.');
        return;
      }
      
      toast.info('Gerando backup do banco de dados...');
      
      const response = await supabase.functions.invoke('generate-backup', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        }
      });

      if (response.error) {
        console.error('Error generating backup:', response.error);
        toast.error(`Erro ao gerar backup: ${response.error}`);
        return;
      }

      if (response.data.error) {
        console.error('Error in response:', response.data.error);
        toast.error(`Erro: ${response.data.error}`);
        return;
      }
      
      if (response.data.fileUrl) {
        toast.success('Backup gerado com sucesso e salvo no GitHub!', {
          description: 'O backup foi salvo no repositório GitHub.',
          action: {
            label: 'Acessar',
            onClick: () => window.open(response.data.fileUrl, '_blank')
          }
        });
      } else if (response.data.backup) {
        // If GitHub upload failed but we have backup data, offer download
        const blob = new Blob([JSON.stringify(response.data.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meu-residencial-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Backup gerado com sucesso!', {
          description: 'O arquivo foi baixado para o seu computador.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao gerar o backup. Por favor, tente novamente.');
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Ferramentas de Administração</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Backup do Banco de Dados</CardTitle>
              <CardDescription>
                Gere um backup completo do banco de dados, incluindo esquemas, tabelas, funções e políticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                O backup será salvo automaticamente no repositório GitHub configurado. 
                Se a configuração do GitHub não estiver completa, o arquivo será baixado para o seu dispositivo.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateBackup} 
                disabled={isGeneratingBackup}
                className="w-full"
              >
                {isGeneratingBackup ? 'Gerando...' : 'Gerar Backup'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Você pode adicionar mais ferramentas administrativas aqui */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTools;
