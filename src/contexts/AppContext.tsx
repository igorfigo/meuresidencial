
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface User {
  nome: string;
  email: string;
  isAdmin: boolean;
  matricula?: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('condoUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('condoUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrMatricula: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Verificar as credenciais do administrador
      if (emailOrMatricula.toLowerCase() === 'meuresidencialcom@gmail.com' && password === 'Bigdream@2025') {
        const adminUser = {
          nome: 'IGOR COSTA ALVES',
          email: 'meuresidencialcom@gmail.com',
          isAdmin: true
        };
        
        setUser(adminUser);
        localStorage.setItem('condoUser', JSON.stringify(adminUser));
        toast.success("Login realizado com sucesso!");
        return true;
      }
      
      // Verificar se é uma tentativa de login com matrícula ou email
      const { data: condominium, error: condoError } = await supabase
        .from('condominiums' as any)
        .select('*')
        .or(`matricula.eq.${emailOrMatricula},emaillegal.eq.${emailOrMatricula}`)
        .eq('senha', password)
        .eq('ativo', true)
        .single();
      
      if (condoError) {
        console.error("Erro ao verificar credenciais:", condoError);
        toast.error("Credenciais inválidas ou usuário inativo. Tente novamente.");
        return false;
      }
      
      if (condominium) {
        // Type assertion to avoid the TypeScript error since we know the shape of data returned
        const condoData = condominium as any;
        
        const condoUser = {
          nome: condoData.nomecondominio || condoData.matricula,
          email: condoData.emaillegal || '',
          isAdmin: false,
          matricula: condoData.matricula
        };
        
        setUser(condoUser);
        localStorage.setItem('condoUser', JSON.stringify(condoUser));
        toast.success("Login realizado com sucesso!");
        return true;
      }
      
      // Simulação de falha no login
      toast.error("Credenciais inválidas ou usuário inativo. Tente novamente.");
      return false;
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      toast.error("Erro ao realizar login. Tente novamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('condoUser');
    toast.info("Logout realizado com sucesso");
  };

  return (
    <AppContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
