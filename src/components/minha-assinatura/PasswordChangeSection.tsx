
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface PasswordChangeSectionProps {
  userMatricula: string;
}

export const PasswordChangeSection = ({ userMatricula }: PasswordChangeSectionProps) => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    try {
      // First, verify if the current password is correct
      const { data: passwordCheck, error: passwordCheckError } = await supabase
        .from('condominiums')
        .select('senha')
        .eq('matricula', userMatricula)
        .single();
        
      if (passwordCheckError) {
        throw passwordCheckError;
      }
      
      if (passwordCheck.senha !== currentPassword) {
        toast.error('Senha atual incorreta');
        setIsLoading(false);
        return;
      }
      
      // If the current password is correct, proceed with password change
      const { data, error } = await supabase
        .from('condominiums')
        .update({ 
          senha: newPassword,
          confirmarsenha: newPassword
        })
        .eq('matricula', userMatricula)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Registrar a alteração no histórico de mudanças com o email do usuário
      await supabase.from('condominium_change_logs').insert([
        {
          matricula: userMatricula,
          campo: 'senha',
          valor_anterior: '********', // Não expor a senha anterior, apenas indicar que foi alterada
          valor_novo: '********', // Não expor a nova senha, apenas indicar que foi alterada
          usuario: user?.email || 'Usuário do Condomínio' // Usar o email do usuário autenticado
        }
      ]);
      
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha Atual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleChangePassword} 
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
        >
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </div>
    </Card>
  );
};
