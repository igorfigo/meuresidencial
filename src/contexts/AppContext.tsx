
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface Condominium {
  matricula: string;
  nomeCondominio: string;
}

interface User {
  nome: string;
  email: string;
  isAdmin: boolean;
  matricula?: string;
  nomeCondominio?: string;
  condominiums?: Condominium[];
  selectedCondominium?: string; // Storing the selected condominium matricula
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchCondominium: (matricula: string) => void;
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
      
      // Check if it's a login with email
      const { data: condominiumsByEmail, error: emailError } = await supabase
        .from('condominiums' as any)
        .select('*')
        .eq('emaillegal', emailOrMatricula.toLowerCase())
        .eq('senha', password)
        .eq('ativo', true);
      
      if (emailError) {
        console.error("Erro ao verificar credenciais por email:", emailError);
      }
      
      // Check if it's a login with matricula
      const { data: condominiumsByMatricula, error: matriculaError } = await supabase
        .from('condominiums' as any)
        .select('*')
        .eq('matricula', emailOrMatricula)
        .eq('senha', password)
        .eq('ativo', true);
      
      if (matriculaError) {
        console.error("Erro ao verificar credenciais por matrícula:", matriculaError);
      }
      
      // Combine the results of both queries
      const allCondominiums = [
        ...(condominiumsByEmail || []),
        ...(condominiumsByMatricula || [])
      ];
      
      // Remove duplicates if any (in case a condominium has the same email and matricula)
      const uniqueCondominiums = Array.from(
        new Map(allCondominiums.map(item => [item.matricula, item])).values()
      );
      
      if (uniqueCondominiums.length > 0) {
        // Format condominiums for the user object
        const condosFormatted = uniqueCondominiums.map(condo => ({
          matricula: condo.matricula,
          nomeCondominio: condo.nomecondominio || 'Condomínio'
        }));
        
        // Use the first condominium as the selected one
        const firstCondo = uniqueCondominiums[0];
        
        const managerUser = {
          nome: firstCondo.nomelegal || firstCondo.matricula,
          email: firstCondo.emaillegal || '',
          isAdmin: false,
          matricula: firstCondo.matricula,
          nomeCondominio: firstCondo.nomecondominio || 'Condomínio',
          condominiums: condosFormatted,
          selectedCondominium: firstCondo.matricula
        };
        
        setUser(managerUser);
        localStorage.setItem('condoUser', JSON.stringify(managerUser));
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

  const switchCondominium = (matricula: string) => {
    if (!user || !user.condominiums) return;
    
    const selectedCondo = user.condominiums.find(c => c.matricula === matricula);
    if (!selectedCondo) return;
    
    const updatedUser = {
      ...user,
      matricula: selectedCondo.matricula,
      nomeCondominio: selectedCondo.nomeCondominio,
      selectedCondominium: selectedCondo.matricula
    };
    
    setUser(updatedUser);
    localStorage.setItem('condoUser', JSON.stringify(updatedUser));
    toast.success(`Condomínio alterado para ${selectedCondo.nomeCondominio}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('condoUser');
    toast.info("Logout realizado com sucesso");
  };

  return (
    <AppContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, switchCondominium }}>
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
