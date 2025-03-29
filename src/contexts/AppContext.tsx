
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
  isResident?: boolean;
  matricula?: string;
  nomeCondominio?: string;
  condominiums?: Condominium[];
  selectedCondominium?: string; // Storing the selected condominium matricula
  
  // Resident specific fields
  residentId?: string;
  unit?: string;
  
  // Address related fields from condominium
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface LoginResult {
  success: boolean;
  inactive?: boolean;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchCondominium: (matricula: string) => void;
}

// Export the AppContext so it can be imported in App.tsx
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('condoUser');
    if (storedUser) {
      try {
        // Add debugging to check the stored user
        const parsedUser = JSON.parse(storedUser);
        console.log("Stored user from localStorage:", parsedUser);
        console.log("Is stored user admin?", parsedUser.isAdmin);
        console.log("Is stored user resident?", parsedUser.isResident);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('condoUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrMatricula: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      // Verificar as credenciais do administrador
      if (emailOrMatricula.toLowerCase() === 'meuresidencialcom@gmail.com' && password === 'Bigdream@2025') {
        const adminUser = {
          nome: 'IGOR COSTA ALVES',
          email: 'meuresidencialcom@gmail.com',
          isAdmin: true,
          isResident: false
        };
        
        console.log("Admin user created:", adminUser);
        setUser(adminUser);
        localStorage.setItem('condoUser', JSON.stringify(adminUser));
        toast.success("Login realizado com sucesso!");
        return { success: true };
      }
      
      // Check if it's a manager login with email
      const { data: emailData, error: emailError } = await supabase
        .from('condominiums')
        .select('*')
        .eq('emaillegal', emailOrMatricula.toLowerCase())
        .eq('senha', password);
      
      if (emailError) {
        console.error("Erro ao verificar credenciais por email:", emailError);
      }
      
      // Check if it's a manager login with matricula
      const { data: matriculaData, error: matriculaError } = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', emailOrMatricula)
        .eq('senha', password);
      
      if (matriculaError) {
        console.error("Erro ao verificar credenciais por matrícula:", matriculaError);
      }
      
      // Check if manager exists but is inactive
      const inactiveCheck = await checkInactiveManager(emailOrMatricula, password);
      if (inactiveCheck.inactive) {
        toast.error("Conta desativada. Entre em contato com a administração.");
        return { success: false, inactive: true };
      }
      
      // Combine the results of both queries and ensure they're treated as arrays
      const emailDataArray = emailData || [];
      const matriculaDataArray = matriculaData || [];
      const allCondominiums = [...emailDataArray, ...matriculaDataArray];
      
      // TypeScript cast to avoid type errors
      const typedCondominiums = allCondominiums as Array<{
        matricula: string;
        nomecondominio: string;
        nomelegal: string;
        emaillegal: string;
        rua?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
      }>;
      
      // Remove duplicates if any (in case a condominium has the same email and matricula)
      const uniqueCondominiums = Array.from(
        new Map(typedCondominiums.map(item => [item.matricula, item])).values()
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
          isResident: false,
          matricula: firstCondo.matricula,
          nomeCondominio: firstCondo.nomecondominio || 'Condomínio',
          condominiums: condosFormatted,
          selectedCondominium: firstCondo.matricula,
          // Add address details
          rua: firstCondo.rua,
          numero: firstCondo.numero,
          complemento: firstCondo.complemento,
          bairro: firstCondo.bairro,
          cidade: firstCondo.cidade,
          estado: firstCondo.estado,
          cep: firstCondo.cep,
        };
        
        setUser(managerUser);
        localStorage.setItem('condoUser', JSON.stringify(managerUser));
        toast.success("Login realizado com sucesso!");
        return { success: true };
      }
      
      // Check for resident login (email is the registered email, password is their CPF)
      const { data: residents, error: residentError } = await supabase
        .from('residents')
        .select('*')
        .eq('email', emailOrMatricula.toLowerCase())
        .eq('cpf', password);
      
      if (residentError) {
        console.error("Erro ao verificar credenciais de morador:", residentError);
      }
      
      if (residents && residents.length > 0) {
        const resident = residents[0];
        
        // Get condominium info for the resident
        const { data: condoData, error: condoError } = await supabase
          .from('condominiums')
          .select('*')
          .eq('matricula', resident.matricula)
          .eq('ativo', true)
          .single();
        
        if (condoError) {
          console.error("Erro ao obter dados do condomínio do morador:", condoError);
          toast.error("Não foi possível obter os dados do condomínio associado a este morador.");
          return { success: false };
        }
        
        if (!condoData) {
          toast.error("Condomínio não encontrado ou inativo.");
          return { success: false };
        }
        
        const residentUser = {
          nome: resident.nome_completo,
          email: resident.email || '',
          isAdmin: false,
          isResident: true,
          residentId: resident.id,
          matricula: resident.matricula,
          unit: resident.unidade,
          nomeCondominio: condoData.nomecondominio || 'Condomínio',
          // Add address details from condominium
          rua: condoData.rua,
          numero: condoData.numero,
          complemento: condoData.complemento,
          bairro: condoData.bairro,
          cidade: condoData.cidade,
          estado: condoData.estado,
          cep: condoData.cep,
        };
        
        setUser(residentUser);
        localStorage.setItem('condoUser', JSON.stringify(residentUser));
        toast.success("Login de morador realizado com sucesso!");
        
        // Create Supabase auth user if they don't exist yet
        // This is for future use with RLS policies
        try {
          // Check if there's already a user_id for this resident
          if (!resident.user_id) {
            // Will handle linking auth users in a separate function when needed
            console.log("Resident login successful - future auth integration will be implemented");
          }
        } catch (authError) {
          console.error("Error in resident auth setup:", authError);
          // Still allow login even if auth setup fails - this is just for future RLS
        }
        
        return { success: true };
      }
      
      // Simulação de falha no login
      toast.error("Credenciais inválidas ou usuário inativo. Tente novamente.");
      return { success: false };
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      toast.error("Erro ao realizar login. Tente novamente.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if manager exists but is inactive
  const checkInactiveManager = async (emailOrMatricula: string, password: string) => {
    try {
      // Check by email
      const { data: inactiveEmailData } = await supabase
        .from('condominiums')
        .select('*')
        .eq('emaillegal', emailOrMatricula.toLowerCase())
        .eq('senha', password)
        .eq('ativo', false);
        
      // Check by matricula
      const { data: inactiveMatriculaData } = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', emailOrMatricula)
        .eq('senha', password)
        .eq('ativo', false);
        
      const hasInactiveAccount = 
        (inactiveEmailData && inactiveEmailData.length > 0) || 
        (inactiveMatriculaData && inactiveMatriculaData.length > 0);
        
      return { inactive: hasInactiveAccount };
    } catch (error) {
      console.error("Error checking inactive account:", error);
      return { inactive: false };
    }
  };

  const switchCondominium = (matricula: string) => {
    if (!user || !user.condominiums) return;
    
    const selectedCondo = user.condominiums.find(c => c.matricula === matricula);
    if (!selectedCondo) return;
    
    // Need to get the full condominium data to include address details
    supabase.from('condominiums')
      .select('*')
      .eq('matricula', matricula)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Error fetching condominium details:", error);
          return;
        }
        
        const updatedUser = {
          ...user,
          matricula: selectedCondo.matricula,
          nomeCondominio: selectedCondo.nomeCondominio,
          selectedCondominium: selectedCondo.matricula,
          // Add address details from fetched data
          rua: data.rua,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
        };
        
        setUser(updatedUser);
        localStorage.setItem('condoUser', JSON.stringify(updatedUser));
        toast.success(`Condomínio alterado para ${selectedCondo.nomeCondominio}`);
      });
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
