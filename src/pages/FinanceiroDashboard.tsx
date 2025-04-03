import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Minus, Wallet, PiggyBank, FileText, FilePlus, FileMinus } from 'lucide-react';
import { FinanceiroReceitas } from './FinanceiroReceitas';
import { FinanceiroDespesas } from './FinanceiroDespesas';
import { FinanceiroFluxoCaixa } from './FinanceiroFluxoCaixa';
import { FinanceiroRecebimentoPix } from './FinanceiroRecebimentoPix';
import { DuvidasFrequentes } from './DuvidasFrequentes';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { BalanceDisplay } from '@/components/financials/BalanceDisplay';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FinanceiroDashboard = () => {
  const [selectedTab, setSelectedTab] = useState<"income" | "expense">("income");
  const { user } = useApp();
  const [balance, setBalance] = useState('');
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  
  useEffect(() => {
    fetchBalance();
  }, [user?.selectedCondominium]);
  
  const fetchBalance = async () => {
    if (!user?.selectedCondominium) return;
    
    setIsBalanceLoading(true);
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('saldo')
        .eq('matricula', user.selectedCondominium)
        .single();
        
      if (error) {
        throw error;
      }
      
      setBalance(data?.saldo || '0.00');
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Erro ao carregar saldo.');
      setBalance('0.00');
    } finally {
      setIsBalanceLoading(false);
    }
  };
  
  const handleBalanceChange = async (newBalance: string) => {
    if (!user?.selectedCondominium) return;
    
    try {
      const { error } = await supabase
        .from('condominiums')
        .update({ saldo: newBalance })
        .eq('matricula', user.selectedCondominium);
        
      if (error) {
        throw error;
      }
      
      setBalance(newBalance);
      toast.success('Saldo atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Erro ao atualizar saldo.');
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-t-4 border-t-brand-600 shadow-md">
            <CardContent className="p-4">
              <BalanceDisplay 
                balance={balance}
                onBalanceChange={handleBalanceChange}
                matricula={user?.selectedCondominium}
              />
            </CardContent>
          </Card>
          
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="income" className="bg-brand-600 text-white data-[state=active]:bg-brand-700">
              <Plus className="mr-1" /> Receitas
            </TabsTrigger>
            <TabsTrigger value="expense" className="bg-brand-600 text-white data-[state=active]:bg-brand-700">
              <Minus className="mr-1" /> Despesas
            </TabsTrigger>
          </TabsList>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsContent value="income">
              <FinanceiroReceitas />
            </TabsContent>
            <TabsContent value="expense">
              <FinanceiroDespesas />
            </TabsContent>
          </Tabs>
          
          <FinanceiroFluxoCaixa />
          
          <FinanceiroRecebimentoPix />
          
          <DuvidasFrequentes />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroDashboard;
