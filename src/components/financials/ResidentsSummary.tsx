
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

export const ResidentsSummary = () => {
  const { user } = useApp();
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitStats, setUnitStats] = useState<any[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  
  useEffect(() => {
    const fetchResidents = async () => {
      if (!user?.selectedCondominium) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('*')
          .eq('matricula', user.selectedCondominium);
        
        if (error) throw error;
        
        setResidents(data || []);
        
        // Count units with and without residents
        const unitMap = new Map();
        data?.forEach(resident => {
          if (resident.unidade) {
            unitMap.set(resident.unidade, true);
          }
        });
        
        // This is an approximation since we don't know the actual total number of units
        const totalUnitsEstimate = Math.max(unitMap.size, 20); // Assumes at least 20 units or the number with residents
        setTotalUnits(totalUnitsEstimate);
        
        const occupiedUnits = unitMap.size;
        const vacantUnits = totalUnitsEstimate - occupiedUnits;
        
        setUnitStats([
          { name: 'Ocupadas', value: occupiedUnits },
          { name: 'Disponíveis', value: vacantUnits }
        ]);
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResidents();
  }, [user?.selectedCondominium]);
  
  // Chart colors
  const COLORS = ['#10b981', '#d1d5db'];
  
  const occupancyRate = totalUnits > 0 
    ? ((unitStats[0]?.value || 0) / totalUnits * 100).toFixed(1) 
    : '0';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Resumo de Moradores</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{residents.length} moradores</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-sm text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Ocupação de Unidades</h3>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={unitStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {unitStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} unidades`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium">Taxa de Ocupação: </span>
                <span className="text-sm">{occupancyRate}%</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Distribuição por Unidade</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {residents.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum morador cadastrado</p>
                ) : (
                  Array.from(
                    residents.reduce((acc, resident) => {
                      const unit = resident.unidade || 'Sem unidade';
                      if (!acc.has(unit)) {
                        acc.set(unit, []);
                      }
                      acc.get(unit).push(resident);
                      return acc;
                    }, new Map())
                  ).map(([unit, unitResidents], index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                      <span className="text-sm font-medium">Unidade {unit}</span>
                      <Badge variant="secondary">{(unitResidents as any[]).length}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
