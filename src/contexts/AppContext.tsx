
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('condoUser');
    if (storedUser) {
      try {
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
      const adminUsers = [
        {
          email: 'meuresidencialcom@gmail.com',
          password: 'Bigdream@2025',
          nome: 'IGOR COSTA ALVES'
        },
        {
          email: 'eugenio.coimbra@meuresidencial.com',
          password: 'Neno2104',
          nome: 'EUGÊNIO COIMBRA'
        },
        {
          email: 'igor.alves@meuresidencial.com',
          password: 'Olivia1963',
          nome: 'IGOR ALVES'
        }
      ];
      
      const adminUser = adminUsers.find(
        admin => admin.email.toLowerCase() === emailOrMatricula.toLowerCase() && admin.password === password
      );
      
      if (adminUser) {
        const adminUserData = {
          nome: adminUser.nome,
          email: adminUser.email,
          isAdmin: true,
          isResident: false
        };
        
        console.log("Admin user created:", adminUserData);
        setUser(adminUserData);
        localStorage.setItem('condoUser', JSON.stringify(adminUserData));
        toast.success("Login realizado com sucesso!");
        return { success: true };
      }
      
      // Fix for TypeScript errors - properly handle the responses and check data existence
      const emailResponse = await supabase
        .from('condominiums')
        .select('*')
        .eq('emaillegal', emailOrMatricula.toLowerCase())
        .eq('senha', password);
      
      if (emailResponse.error) {
        console.error("Erro ao verificar credenciais por email:", emailResponse.error);
      }
      
      const matriculaResponse = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', emailOrMatricula)
        .eq('senha', password);
      
      if (matriculaResponse.error) {
        console.error("Erro ao verificar credenciais por matrícula:", matriculaResponse.error);
      }
      
      const inactiveCheck = await checkInactiveManager(emailOrMatricula, password);
      if (inactiveCheck.inactive) {
        toast.error("Conta desativada. Entre em contato com a administração.");
        return { success: false, inactive: true };
      }
      
      const emailDataArray = emailResponse.data || [];
      const matriculaDataArray = matriculaResponse.data || [];
      const allCondominiums = [...emailDataArray, ...matriculaDataArray];
      
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
      
      const uniqueCondominiums = Array.from(
        new Map(typedCondominiums.map(item => [item.matricula, item])).values()
      );
      
      if (uniqueCondominiums.length > 0) {
        const condosFormatted = uniqueCondominiums.map(condo => ({
          matricula: condo.matricula,
          nomeCondominio: condo.nomecondominio || 'Condomínio'
        }));
        
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
      
      // Fix for TypeScript errors - properly handle the response and check data existence
      const residentResponse = await supabase
        .from('residents')
        .select('*')
        .eq('email', emailOrMatricula.toLowerCase())
        .eq('cpf', password);
      
      if (residentResponse.error) {
        console.error("Erro ao verificar credenciais de morador:", residentResponse.error);
      }
      
      if (residentResponse.data && residentResponse.data.length > 0) {
        const resident = residentResponse.data[0];
        
        // Fix for TypeScript errors - properly handle the response and check data existence
        const condoResponse = await supabase
          .from('condominiums')
          .select('*')
          .eq('matricula', resident.matricula)
          .eq('ativo', true)
          .single();
        
        if (condoResponse.error) {
          console.error("Erro ao obter dados do condomínio do morador:", condoResponse.error);
          toast.error("Não foi possível obter os dados do condomínio associado a este morador.");
          return { success: false };
        }
        
        if (!condoResponse.data) {
          toast.error("Condomínio não encontrado ou inativo.");
          return { success: false };
        }
        
        const condoData = condoResponse.data;
        
        const residentUser = {
          nome: resident.nome_completo,
          email: resident.email || '',
          isAdmin: false,
          isResident: true,
          residentId: resident.id,
          matricula: resident.matricula,
          unit: resident.unidade,
          nomeCondominio: condoData.nomecondominio || 'Condomínio',
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
        
        try {
          if (!resident.user_id) {
            console.log("Resident login successful - future auth integration will be implemented");
          }
        } catch (authError) {
          console.error("Error in resident auth setup:", authError);
        }
        
        return { success: true };
      }
      
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

  const checkInactiveManager = async (emailOrMatricula: string, password: string) => {
    try {
      const inactiveEmailResponse = await supabase
        .from('condominiums')
        .select('*')
        .eq('emaillegal', emailOrMatricula.toLowerCase())
        .eq('senha', password)
        .eq('ativo', false);
        
      const inactiveMatriculaResponse = await supabase
        .from('condominiums')
        .select('*')
        .eq('matricula', emailOrMatricula)
        .eq('senha', password)
        .eq('ativo', false);
        
      const hasInactiveAccount = 
        (inactiveEmailResponse.data && inactiveEmailResponse.data.length > 0) || 
        (inactiveMatriculaResponse.data && inactiveMatriculaResponse.data.length > 0);
        
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
    navigate('/login');
  };

  const contextValue: AppContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    switchCondominium
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
