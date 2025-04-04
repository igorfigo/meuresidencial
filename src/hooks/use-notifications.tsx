
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useApp();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadDocuments, setUnreadDocuments] = useState(0);
  
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const isResident = user?.isResident === true;
  // Need to access the user ID - in AppContext it's stored directly as id
  // Use type assertion to handle the type mismatch
  const userId = user ? (user as any).id : '';
  
  // Only track notifications for residents
  const enabled = isResident && !!matricula && !!userId;

  // Get last viewed timestamps from both localStorage (for backward compatibility) and database
  const fetchLastViewedTime = async (type: 'announcements' | 'documents') => {
    try {
      // Check database for last viewed time first
      if (userId) {
        // Use type assertion to handle the table that might not be in the TypeScript definitions
        const { data, error } = await supabase
          .from('user_notification_views')
          .select('last_viewed_at')
          .eq('user_id', userId)
          .eq('matricula', matricula)
          .eq('notification_type', type)
          .single();
          
        if (!error && data) {
          // Use type assertion to ensure TypeScript knows last_viewed_at exists
          return new Date((data as any).last_viewed_at).getTime();
        }
        
        // If no record exists, create one with the current time
        if (error && error.code === 'PGRST116') {
          const now = new Date().toISOString();
          
          // Create a new record
          const { error: insertError } = await supabase
            .from('user_notification_views')
            .insert({
              user_id: userId,
              matricula,
              notification_type: type,
              last_viewed_at: now
            });
            
          if (insertError) {
            console.error(`Error creating initial view record for ${type}:`, insertError);
          }
          
          // Return current time as this is a new view
          return new Date(now).getTime();
        }
      }
      
      // Fall back to localStorage for backward compatibility
      const stored = localStorage.getItem(`last_viewed_${type}_${matricula}`);
      return stored ? new Date(stored).getTime() : 0;
    } catch (error) {
      console.error(`Error fetching last viewed time for ${type}:`, error);
      return 0;
    }
  };

  // Update last viewed timestamp in both localStorage and database
  const markAsViewed = async (type: 'announcements' | 'documents') => {
    const now = new Date().toISOString();
    
    // Update localStorage for backward compatibility
    localStorage.setItem(`last_viewed_${type}_${matricula}`, now);
    
    // Update database
    if (userId) {
      const { error } = await supabase
        .from('user_notification_views')
        .upsert({
          user_id: userId,
          matricula,
          notification_type: type,
          last_viewed_at: now
        }, {
          onConflict: 'user_id,matricula,notification_type'
        });
        
      if (error) {
        console.error(`Error updating last viewed time for ${type}:`, error);
        toast({
          title: "Erro ao atualizar notificações",
          description: `Não foi possível marcar ${type === 'announcements' ? 'comunicados' : 'documentos'} como vistos.`,
          variant: "destructive",
        });
      }
    }
    
    if (type === 'announcements') {
      setUnreadAnnouncements(0);
    } else {
      setUnreadDocuments(0);
    }
  };

  // Check for new announcements and documents
  useEffect(() => {
    if (!enabled) return;
    
    let lastViewedAnnouncements = 0;
    let lastViewedDocuments = 0;
    
    // Fetch initial data
    const initializeNotifications = async () => {
      try {
        lastViewedAnnouncements = await fetchLastViewedTime('announcements');
        lastViewedDocuments = await fetchLastViewedTime('documents');
        
        console.log("Last viewed announcements:", new Date(lastViewedAnnouncements).toISOString());
        console.log("Last viewed documents:", new Date(lastViewedDocuments).toISOString());
        
        // Function to fetch and count new items
        const fetchNewItems = async () => {
          try {
            // Check for new announcements
            const { data: announcements, error: announcementsError } = await supabase
              .from('announcements')
              .select('created_at')
              .eq('matricula', matricula)
              .gt('created_at', new Date(lastViewedAnnouncements).toISOString());
              
            if (announcementsError) {
              console.error('Error fetching announcements:', announcementsError);
            } else {
              console.log("Unread announcements count:", announcements?.length || 0);
              setUnreadAnnouncements(announcements?.length || 0);
            }
            
            // Check for new documents
            const { data: documents, error: documentsError } = await supabase
              .from('documents')
              .select('created_at')
              .eq('matricula', matricula)
              .gt('created_at', new Date(lastViewedDocuments).toISOString());
              
            if (documentsError) {
              console.error('Error fetching documents:', documentsError);
            } else {
              console.log("Unread documents count:", documents?.length || 0);
              setUnreadDocuments(documents?.length || 0);
            }
          } catch (error) {
            console.error('Error checking for new items:', error);
          }
        };

        // Initial fetch
        await fetchNewItems();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initializeNotifications();
    
    // Set up real-time subscription for announcements
    const announcementsChannel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: `matricula=eq.${matricula}`
        }, 
        async (payload) => {
          console.log("New announcement detected:", payload);
          const currentLastViewed = await fetchLastViewedTime('announcements');
          const payloadDate = new Date(payload.new.created_at).getTime();
          if (payloadDate > currentLastViewed) {
            setUnreadAnnouncements(prev => prev + 1);
            toast({
              title: "Novo comunicado",
              description: "Um novo comunicado foi publicado.",
              variant: "default",
            });
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for documents
    const documentsChannel = supabase
      .channel('documents-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `matricula=eq.${matricula}`
        }, 
        async (payload) => {
          console.log("New document detected:", payload);
          const currentLastViewed = await fetchLastViewedTime('documents');
          const payloadDate = new Date(payload.new.created_at).getTime();
          if (payloadDate > currentLastViewed) {
            setUnreadDocuments(prev => prev + 1);
            toast({
              title: "Novo documento",
              description: "Um novo documento foi publicado.",
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [matricula, enabled, userId]);

  return {
    unreadAnnouncements,
    unreadDocuments,
    markAsViewed
  };
}
