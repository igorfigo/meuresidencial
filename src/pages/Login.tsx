
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
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const SUPABASE_URL = "https://kcbvdcacgbwigefwacrk.supabase.co";

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manager');
  
  // Password recovery states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySending, setRecoverySending] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

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
  
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryError('Por favor, insira seu email ou matrícula');
      return;
    }
    
    setRecoverySending(true);
    setRecoveryError('');
    setRecoverySuccess(false);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-manager-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: recoveryEmail.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email de recuperação');
      }
      
      setRecoverySuccess(true);
      toast.success('Email de recuperação enviado com sucesso!');
      
      // Close dialog after success
      setTimeout(() => {
        setForgotPasswordOpen(false);
        // Reset states after the dialog is closed
        setTimeout(() => {
          setRecoveryEmail('');
          setRecoverySuccess(false);
        }, 300);
      }, 3000);
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      setRecoveryError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setRecoverySending(false);
    }
  };
  
  const resetRecoveryState = () => {
    setRecoveryEmail('');
    setRecoveryError('');
    setRecoverySuccess(false);
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
              {/* Inactive account alert */}
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
              {/* Alert removed as requested */}
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
                    className="text-xs text-blue-200 hover:text-white hover:underline"
                    onClick={() => {
                      resetRecoveryState();
                      setForgotPasswordOpen(true);
                    }}
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
          
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-100">
              Não tem uma conta?{' '}
              <a href="#" className="text-white hover:underline">
                Entre em contato conosco
              </a>
            </p>
          </div>
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
      
      {/* Password Recovery Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperação de Senha</DialogTitle>
            <DialogDescription>
              {recoverySuccess 
                ? 'Email de recuperação enviado com sucesso!'
                : 'Insira seu email ou matrícula para recuperar sua senha.'}
            </DialogDescription>
          </DialogHeader>
          
          {!recoverySuccess ? (
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-foreground">
                  Email ou Matrícula
                </Label>
                <Input
                  id="recovery-email"
                  type="text"
                  placeholder="seu@email.com ou matrícula"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  disabled={recoverySending}
                  required
                />
              </div>
              
              {recoveryError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{recoveryError}</AlertDescription>
                </Alert>
              )}
              
              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotPasswordOpen(false)}
                  disabled={recoverySending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={recoverySending}>
                  {recoverySending ? 'Enviando...' : 'Recuperar Senha'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription>
                  Um email com sua senha foi enviado para o endereço associado à sua conta.
                </AlertDescription>
              </Alert>
              
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
