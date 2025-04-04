
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
      
      let data;
      let error;
      
      try {
        // Attempt to fetch data with error handling
        const result = await supabase
          .from('preventive_alerts')
          .select('*')
          .eq('matricula', matricula)
          .order('alert_date', { ascending: true });
          
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        console.error('Error in Supabase query:', fetchError);
        error = fetchError;
      }
      
      if (error) {
        console.error('Error fetching preventive alerts:', error);
        // Set empty data array when there's an error so the app doesn't break
        data = [];
        toast.error('Erro ao carregar alertas preventivos');
      }

      // Always ensure we have a valid data array even if error occurs
      const safeData = Array.isArray(data) ? data : [];
      
      const formattedData: PreventiveAlert[] = safeData.map(alert => ({
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
      console.error('Error in fetchAlerts function:', error);
      setAlerts([]);
      setPendingAlerts(0);
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
      
      try {
        const { data, error } = await supabase
          .from('preventive_alerts')
          .insert(newAlert)
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Alerta preventivo adicionado com sucesso');
        await fetchAlerts();
        return data;
      } catch (dbError) {
        console.error('Database error adding preventive alert:', dbError);
        throw dbError;
      }
      
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
      
      try {
        const { error } = await supabase
          .from('preventive_alerts')
          .update(dbUpdates)
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Alerta preventivo atualizado com sucesso');
        await fetchAlerts();
        return true;
      } catch (dbError) {
        console.error('Database error updating preventive alert:', dbError);
        throw dbError;
      }
      
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
      try {
        const { error } = await supabase
          .from('preventive_alerts')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Alerta preventivo removido com sucesso');
        await fetchAlerts();
        return true;
      } catch (dbError) {
        console.error('Database error deleting preventive alert:', dbError);
        throw dbError;
      }
      
    } catch (error) {
      console.error('Error deleting preventive alert:', error);
      toast.error('Erro ao remover alerta preventivo');
      return false;
    }
  };

  // Initial fetch and setup realtime subscription with error handling
  useEffect(() => {
    if (matricula) {
      fetchAlerts().catch(error => {
        console.error('Error in fetchAlerts effect:', error);
        setLoading(false);
      });
      
      // Setup realtime subscription with error handling
      let channel;
      try {
        channel = supabase
          .channel('preventive-alerts-changes')
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'preventive_alerts',
              filter: `matricula=eq.${matricula}`
            }, 
            () => {
              fetchAlerts().catch(console.error);
            }
          )
          .subscribe(error => {
            if (error) console.error('Error setting up realtime subscription:', error);
          });
      } catch (error) {
        console.error('Error creating channel:', error);
      }
        
      // Cleanup subscription
      return () => {
        if (channel) {
          try {
            supabase.removeChannel(channel).catch(console.error);
          } catch (error) {
            console.error('Error removing channel:', error);
          }
        }
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
