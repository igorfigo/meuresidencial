
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

interface User {
  nome: string;
  email: string;
  isAdmin: boolean;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Verificar as credenciais do administrador
      if (email.toLowerCase() === 'meuresidencialcom@gmail.com' && password === 'Bigdream@2025') {
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
      
      // Simulação de falha no login
      toast.error("Credenciais inválidas. Tente novamente.");
      return false;
    } catch (error) {
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
