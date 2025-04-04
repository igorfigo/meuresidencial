
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordChangeSectionProps {
  userMatricula: string;
}

export const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({ userMatricula }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${userMatricula}@temp.com`, // Using matricula as email
        password: data.currentPassword,
      });
      
      if (signInError) {
        throw new Error('Senha atual incorreta');
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success('Senha alterada com sucesso');
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
      toast.error(errorMessage);
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Card className="border-t-4 border-t-brand-600 shadow-md">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg">
          <KeyRound className="h-5 w-5 mr-2 text-brand-600" />
          Alterar Senha
        </CardTitle>
        <CardDescription>
          Altere sua senha de acesso ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showCurrentPassword ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Digite sua nova senha"
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showNewPassword ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua nova senha"
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showConfirmPassword ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className={isMobile ? "w-full" : ""}
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
