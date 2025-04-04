import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Eye, EyeOff, Lock, Mail, Users, Wallet, Calendar, Bell, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manager');

  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setInactiveAccount(false);
    const result = await login(identifier, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else if (result.inactive) {
      setInactiveAccount(true);
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordEmail) {
      toast.error('Por favor, informe seu email');
      return;
    }
    
    setResetLoading(true);
    
    try {
      const response = await fetch('https://kcbvdcacgbwigefwacrk.supabase.co/functions/v1/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetPasswordEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email de redefinição de senha enviado com sucesso');
        setResetDialogOpen(false);
        setResetPasswordEmail('');
      } else {
        toast.error(`Erro ao enviar email: ${data.error || 'Tente novamente mais tarde'}`);
      }
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      toast.error('Erro ao processar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="sm:w-1/2 flex flex-col justify-center items-center p-8 sm:p-16 animate-fade-in bg-brand-700 text-white">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-4">
              <Building className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white ml-2 font-display">MeuResidencial</h1>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-1">Seja bem-vindo!</h2>
            <p className="text-blue-100">Faça login para acessar sua conta</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-brand-800/40">
              <TabsTrigger value="manager" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">Síndico</TabsTrigger>
              <TabsTrigger value="resident" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">Morador</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manager">
              {inactiveAccount && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Conta desativada</AlertTitle>
                  <AlertDescription>
                    Sua conta de síndico está desativada. Por favor, entre em contato com a administração do sistema para reativá-la.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="resident">
            </TabsContent>
          </Tabs>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-white">
                {activeTab === 'manager' ? 'Email ou Matrícula' : 'Email'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-800" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder={activeTab === 'manager' ? "seu@email.com ou matrícula" : "seu@email.com"}
                  className="pl-9 bg-white/90 text-gray-800"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  tabIndex={1}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  {activeTab === 'manager' ? 'Senha' : 'CPF (Senha)'}
                </Label>
                {activeTab === 'manager' && (
                  <button 
                    type="button"
                    onClick={() => setResetDialogOpen(true)}
                    className="text-xs text-blue-200 hover:text-white hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-800" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={activeTab === 'manager' ? "Sua senha" : "Seu CPF (apenas números)"}
                  className="pl-9 bg-white/90 text-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={activeTab === 'resident' ? 11 : undefined}
                  numberOnly={activeTab === 'resident'}
                  tabIndex={2}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={3}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-white hover:bg-gray-100 text-brand-700 hover:text-brand-800"
              disabled={loading}
              tabIndex={4}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
      
      <div className="hidden sm:flex sm:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-6 font-display text-brand-800">Gerencie seu condomínio com facilidade</h2>
          <p className="text-lg text-brand-700 mb-8">
            Uma plataforma completa para síndicos profissionais administrarem 
            condomínios de forma eficiente e moderna.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-2">
              <div className="mt-1 rounded-full bg-brand-600/20 p-1">
                <Users className="h-4 w-4 text-brand-700" />
              </div>
              <div>
                <h3 className="font-medium text-brand-800">Gestão de moradores</h3>
                <p className="text-sm text-brand-600">Cadastro e comunicação eficiente</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-1 rounded-full bg-brand-600/20 p-1">
                <Wallet className="h-4 w-4 text-brand-700" />
              </div>
              <div>
                <h3 className="font-medium text-brand-800">Controle financeiro</h3>
                <p className="text-sm text-brand-600">Gestão de despesas e receitas</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-1 rounded-full bg-brand-600/20 p-1">
                <Calendar className="h-4 w-4 text-brand-700" />
              </div>
              <div>
                <h3 className="font-medium text-brand-800">Agendamentos</h3>
                <p className="text-sm text-brand-600">Áreas comuns e manutenções</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-1 rounded-full bg-brand-600/20 p-1">
                <Bell className="h-4 w-4 text-brand-700" />
              </div>
              <div>
                <h3 className="font-medium text-brand-800">Notificações</h3>
                <p className="text-sm text-brand-600">Avisos e comunicados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Esqueceu sua senha?</DialogTitle>
            <DialogDescription>
              Digite seu email abaixo para receber um link de redefinição de senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetPasswordEmail}
                  onChange={(e) => setResetPasswordEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={resetLoading}>
                {resetLoading ? 'Enviando...' : 'Enviar link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
