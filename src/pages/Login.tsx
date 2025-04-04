
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

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manager');

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

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-700/20 via-transparent to-transparent animate-pulse-slow"></div>
        <div className="grid grid-cols-12 h-full w-full opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="col-span-1 border-r border-white/10 h-full" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i + 12} className="absolute border-t border-white/10 w-full" style={{ top: `${(i + 1) * 8.33}%` }} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <div className="sm:w-1/2 flex flex-col justify-center items-center p-8 sm:p-16 animate-fade-in bg-black/40 backdrop-blur-lg text-white relative z-10">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-4">
              <div className="relative">
                <Building className="h-8 w-8 text-white relative z-10" />
                <div className="absolute -inset-1 bg-brand-500/50 rounded-full blur-lg"></div>
              </div>
              <h1 className="text-3xl font-bold text-white ml-2 font-display">MeuResidencial</h1>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-1">Seja bem-vindo!</h2>
            <p className="text-blue-100">Faça login para acessar sua conta</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/40 border border-white/10">
              <TabsTrigger value="manager" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">Síndico</TabsTrigger>
              <TabsTrigger value="resident" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">Morador</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manager">
              {/* Inactive account alert */}
              {inactiveAccount && (
                <Alert variant="destructive" className="mb-4 border-red-500 bg-red-500/10">
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
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-300 transition-all group-hover:text-brand-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder={activeTab === 'manager' ? "seu@email.com ou matrícula" : "seu@email.com"}
                  className="pl-9 bg-white/10 text-gray-100 border-white/10 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  tabIndex={1}
                />
                <div className="absolute inset-0 border border-brand-500/0 rounded-md transition-all group-hover:border-brand-500/50 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  {activeTab === 'manager' ? 'Senha' : 'CPF (Senha)'}
                </Label>
                {activeTab === 'manager' && (
                  <a href="#" className="text-xs text-blue-300 hover:text-white hover:underline transition-colors">
                    Esqueceu a senha?
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-300 transition-all group-hover:text-brand-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={activeTab === 'manager' ? "Sua senha" : "Seu CPF (apenas números)"}
                  className="pl-9 bg-white/10 text-gray-100 border-white/10 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={activeTab === 'resident' ? 11 : undefined}
                  numberOnly={activeTab === 'resident'}
                  tabIndex={2}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={3}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <div className="absolute inset-0 border border-brand-500/0 rounded-md transition-all group-hover:border-brand-500/50 pointer-events-none"></div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white transition-all relative overflow-hidden group"
              disabled={loading}
              tabIndex={4}
            >
              <span className="relative z-10">
                {loading ? 'Carregando...' : 'Entrar'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200">
              Não tem uma conta?{' '}
              <a href="#" className="text-white hover:text-brand-300 transition-colors hover:underline">
                Entre em contato conosco
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:flex sm:w-1/2 text-gray-100 flex-col justify-center items-center p-16 relative z-10">
        <div className="relative z-10 max-w-lg text-center">
          <div className="relative mb-6 inline-block">
            <h2 className="text-4xl font-bold mb-0 font-display text-white drop-shadow-lg">Gerencie seu condomínio com facilidade</h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent"></div>
          </div>
          <p className="text-lg text-blue-100 mb-8">
            Uma plataforma completa para síndicos profissionais administrarem 
            condomínios de forma eficiente e moderna.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="rounded-full bg-brand-600/20 p-2 group-hover:bg-brand-600/40 transition-colors">
                <Users className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Gestão de moradores</h3>
                <p className="text-sm text-blue-200">Cadastro e comunicação eficiente</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="rounded-full bg-brand-600/20 p-2 group-hover:bg-brand-600/40 transition-colors">
                <Wallet className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Controle financeiro</h3>
                <p className="text-sm text-blue-200">Gestão de despesas e receitas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="rounded-full bg-brand-600/20 p-2 group-hover:bg-brand-600/40 transition-colors">
                <Calendar className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Agendamentos</h3>
                <p className="text-sm text-blue-200">Áreas comuns e manutenções</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="rounded-full bg-brand-600/20 p-2 group-hover:bg-brand-600/40 transition-colors">
                <Bell className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Notificações</h3>
                <p className="text-sm text-blue-200">Avisos e comunicados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Digital circuit lines in the background */}
      <div className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-600/30 to-transparent"></div>
      <div className="absolute top-3/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
      <div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-brand-600/10 blur-3xl"></div>
      <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl"></div>
    </div>
  );
};

export default Login;
