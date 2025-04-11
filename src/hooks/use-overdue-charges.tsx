
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

export const useOverdueCharges = () => {
  const { user } = useApp();
  const [overdueCount, setOverdueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOverdueCharges = async () => {
      if (!user?.residentId || !user.matricula || !user.unit) {
        setOverdueCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get current date
        const today = new Date();
        const currentYear = today.getFullYear().toString();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

        // Get any existing paid charges
        const { data: paidCharges } = await supabase
          .from('financial_incomes')
          .select('reference_month')
          .eq('matricula', user.matricula)
          .eq('unit', user.unit);

        // Get PIX settings to determine due date
        const { data: pixSettings } = await supabase
          .from('pix_receipt_settings')
          .select('diavencimento')
          .eq('matricula', user.matricula)
          .single();

        const dueDay = pixSettings?.diavencimento || '10';
        
        // Create a map of paid months
        const paidMonthsMap = new Map();
        if (paidCharges) {
          paidCharges.forEach(charge => {
            if (charge.reference_month) {
              paidMonthsMap.set(charge.reference_month, true);
            }
          });
        }

        // Calculate overdue months for current year
        let overdue = 0;
        const dueDayNum = parseInt(dueDay);
        
        // Get resident creation date to check if we should count a month
        const { data: residentData } = await supabase
          .from('residents')
          .select('created_at')
          .eq('id', user.residentId)
          .single();
          
        const residentCreationDate = residentData?.created_at ? new Date(residentData.created_at) : null;
        
        for (let month = 1; month <= parseInt(currentMonth); month++) {
          const monthStr = month.toString().padStart(2, '0');
          const referenceMonth = `${currentYear}-${monthStr}`;
          
          // Check if this month has already been paid
          if (!paidMonthsMap.has(referenceMonth)) {
            // If not paid and due date has passed, it's overdue
            const dueDate = new Date(parseInt(currentYear), month - 1, dueDayNum);
            
            // Only count if the resident already existed when the payment was due
            // and the due date has passed
            if (today > dueDate && 
                (!residentCreationDate || dueDate >= residentCreationDate)) {
              overdue++;
            }
          }
        }
        
        setOverdueCount(overdue);
        // Store in localStorage for the badge in DashboardLayout
        localStorage.setItem('overdueChargesCount', overdue.toString());
      } catch (error) {
        console.error('Error checking overdue charges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOverdueCharges();

    // Set up a real-time subscription to update if any payments come in
    const channel = supabase
      .channel('financial-payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_incomes'
      }, () => checkOverdueCharges())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.residentId, user?.matricula, user?.unit]);

  return { overdueCount, isLoading };
};
