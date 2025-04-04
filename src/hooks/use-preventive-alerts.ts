
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { PreventiveAlert, PreventiveAlertCategory } from '@/types/preventiveAlerts';
import { toast } from 'sonner';

export function usePreventiveAlerts() {
  const { user } = useApp();
  const [alerts, setAlerts] = useState<PreventiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAlerts, setPendingAlerts] = useState(0);
  const matricula = user?.selectedCondominium || user?.matricula;

  const fetchAlerts = async () => {
    if (!matricula) return;
    
    try {
      setLoading(true);
      // Use type assertion to work around TypeScript errors with Supabase client
      // since the preventive_alerts table was just created
      const { data, error } = await supabase
        .from('preventive_alerts' as any)
        .select('*')
        .eq('matricula', matricula)
        .order('alert_date', { ascending: true });
        
      if (error) throw error;

      const formattedData: PreventiveAlert[] = data.map(alert => ({
        id: alert.id,
        matricula: alert.matricula,
        category: alert.category as PreventiveAlertCategory,
        alertDate: new Date(alert.alert_date),
        observations: alert.observations || '',
        isCompleted: alert.is_completed,
        createdAt: new Date(alert.created_at),
        updatedAt: new Date(alert.updated_at)
      }));
      
      setAlerts(formattedData);

      // Count pending alerts (alerts that are due today or in the past and not completed)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pending = formattedData.filter(alert => 
        !alert.isCompleted && new Date(alert.alertDate) <= today
      ).length;
      
      setPendingAlerts(pending);
      
    } catch (error) {
      console.error('Error fetching preventive alerts:', error);
      toast.error('Erro ao carregar alertas preventivos');
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async (
    category: PreventiveAlertCategory,
    alertDate: Date,
    observations: string
  ) => {
    if (!matricula) return null;
    
    try {
      const newAlert = {
        matricula,
        category,
        alert_date: alertDate.toISOString(),
        observations,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Use type assertion to work around TypeScript errors
      const { data, error } = await supabase
        .from('preventive_alerts' as any)
        .insert(newAlert)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Alerta preventivo adicionado com sucesso');
      await fetchAlerts();
      return data;
      
    } catch (error) {
      console.error('Error adding preventive alert:', error);
      toast.error('Erro ao adicionar alerta preventivo');
      return null;
    }
  };

  const updateAlert = async (id: string, updates: Partial<PreventiveAlert>) => {
    try {
      // Convert from our frontend model to the database model
      const dbUpdates: any = {};
      if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
      if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
      if (updates.alertDate !== undefined) dbUpdates.alert_date = updates.alertDate.toISOString();
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      
      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();
      
      // Use type assertion to work around TypeScript errors
      const { error } = await supabase
        .from('preventive_alerts' as any)
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Alerta preventivo atualizado com sucesso');
      await fetchAlerts();
      return true;
      
    } catch (error) {
      console.error('Error updating preventive alert:', error);
      toast.error('Erro ao atualizar alerta preventivo');
      return false;
    }
  };

  const toggleAlertCompletion = async (id: string, isCompleted: boolean) => {
    return updateAlert(id, { isCompleted });
  };

  const deleteAlert = async (id: string) => {
    try {
      // Use type assertion to work around TypeScript errors
      const { error } = await supabase
        .from('preventive_alerts' as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Alerta preventivo removido com sucesso');
      await fetchAlerts();
      return true;
      
    } catch (error) {
      console.error('Error deleting preventive alert:', error);
      toast.error('Erro ao remover alerta preventivo');
      return false;
    }
  };

  // Initial fetch and setup realtime subscription
  useEffect(() => {
    if (matricula) {
      fetchAlerts();
      
      // Setup realtime subscription
      const channel = supabase
        .channel('preventive-alerts-changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'preventive_alerts',
            filter: `matricula=eq.${matricula}`
          }, 
          () => {
            fetchAlerts();
          }
        )
        .subscribe();
        
      // Cleanup subscription
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [matricula]);

  return {
    alerts,
    loading,
    pendingAlerts,
    addAlert,
    updateAlert,
    toggleAlertCompletion,
    deleteAlert,
    fetchAlerts
  };
}
