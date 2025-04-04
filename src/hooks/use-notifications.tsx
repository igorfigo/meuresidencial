
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

export function useNotifications() {
  const { user } = useApp();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadDocuments, setUnreadDocuments] = useState(0);
  
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const isResident = user?.isResident === true;
  const userId = user?.id || '';
  
  // Only track notifications for residents
  const enabled = isResident && !!matricula && !!userId;

  // Get last viewed timestamps from both localStorage (for backward compatibility) and database
  const fetchLastViewedTime = async (type: 'announcements' | 'documents') => {
    try {
      // Check database for last viewed time first
      if (userId) {
        const { data, error } = await supabase
          .from('user_notification_views')
          .select('last_viewed_at')
          .eq('user_id', userId)
          .eq('matricula', matricula)
          .eq('notification_type', type)
          .single();
          
        if (!error && data) {
          return new Date(data.last_viewed_at).getTime();
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
      lastViewedAnnouncements = await fetchLastViewedTime('announcements');
      lastViewedDocuments = await fetchLastViewedTime('documents');
      
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
            setUnreadDocuments(documents?.length || 0);
          }
        } catch (error) {
          console.error('Error checking for new items:', error);
        }
      };

      // Initial fetch
      await fetchNewItems();
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
          const currentLastViewed = await fetchLastViewedTime('announcements');
          const payloadDate = new Date(payload.new.created_at).getTime();
          if (payloadDate > currentLastViewed) {
            setUnreadAnnouncements(prev => prev + 1);
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
          const currentLastViewed = await fetchLastViewedTime('documents');
          const payloadDate = new Date(payload.new.created_at).getTime();
          if (payloadDate > currentLastViewed) {
            setUnreadDocuments(prev => prev + 1);
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
