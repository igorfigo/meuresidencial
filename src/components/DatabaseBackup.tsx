
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const DatabaseBackup = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateBackup = async () => {
    try {
      setIsGenerating(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Autorização necessária",
          description: "Você precisa estar logado para gerar um backup.",
          variant: "destructive",
        });
        return;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-backup', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Falha ao gerar backup');
      }

      if (!data || !data.backup) {
        throw new Error('Dados do backup não retornados');
      }

      // Convert backup data to a JSON string and create a downloadable file
      const backupStr = JSON.stringify(data.backup, null, 2);
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Format date for filename
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      a.href = url;
      a.download = `meu-residencial-backup-${formattedDate}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Backup gerado com sucesso!",
        description: "O arquivo foi baixado para seu computador.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao gerar backup:", error);
      toast({
        title: "Erro ao gerar backup",
        description: error.message || "Ocorreu um erro ao gerar o backup do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-2">Backup do Banco de Dados</h3>
      <p className="text-gray-600 mb-4">Gere um backup completo do banco de dados, incluindo esquemas, tabelas, funções e políticas.</p>
      <Button 
        onClick={generateBackup} 
        disabled={isGenerating}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando Backup...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Gerar Backup
          </>
        )}
      </Button>
    </div>
  );
};

export default DatabaseBackup;
