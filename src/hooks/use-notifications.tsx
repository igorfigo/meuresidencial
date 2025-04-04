
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

export function useNotifications() {
  const { user } = useApp();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadDocuments, setUnreadDocuments] = useState(0);
  const [unreadGarageListings, setUnreadGarageListings] = useState(0);
  
  const matricula = user?.selectedCondominium || user?.matricula || '';
  const isResident = user?.isResident === true;
  
  // Only track notifications for residents
  const enabled = isResident && !!matricula;

  // Get last viewed timestamps from localStorage
  const getLastViewedTime = (key: string) => {
    const stored = localStorage.getItem(`last_viewed_${key}_${matricula}`);
    return stored ? new Date(stored).getTime() : 0;
  };

  // Update last viewed timestamp
  const markAsViewed = (type: 'announcements' | 'documents' | 'garage_listings') => {
    const now = new Date().toISOString();
    localStorage.setItem(`last_viewed_${type}_${matricula}`, now);
    
    if (type === 'announcements') {
      setUnreadAnnouncements(0);
    } else if (type === 'documents') {
      setUnreadDocuments(0);
    } else if (type === 'garage_listings') {
      setUnreadGarageListings(0);
    }
  };

  // Check for new announcements, documents, and garage listings
  useEffect(() => {
    if (!enabled) return;

    const lastViewedAnnouncements = getLastViewedTime('announcements');
    const lastViewedDocuments = getLastViewedTime('documents');
    const lastViewedGarageListings = getLastViewedTime('garage_listings');
    
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
        
        // Check for new garage listings
        const { data: garageListings, error: garageListingsError } = await supabase
          .from('garage_listings')
          .select('created_at')
          .eq('matricula', matricula)
          .eq('is_available', true)
          .gt('created_at', new Date(lastViewedGarageListings).toISOString());
          
        if (garageListingsError) {
          console.error('Error fetching garage listings:', garageListingsError);
        } else {
          setUnreadGarageListings(garageListings?.length || 0);
        }
      } catch (error) {
        console.error('Error checking for new items:', error);
      }
    };

    // Initial fetch
    fetchNewItems();
    
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
        (payload) => {
          setUnreadAnnouncements(prev => prev + 1);
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
        (payload) => {
          setUnreadDocuments(prev => prev + 1);
        }
      )
      .subscribe();
      
    // Set up real-time subscription for garage listings
    const garageListingsChannel = supabase
      .channel('garage-listings-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'garage_listings',
          filter: `matricula=eq.${matricula}`
        }, 
        (payload) => {
          setUnreadGarageListings(prev => prev + 1);
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(garageListingsChannel);
    };
  }, [matricula, enabled]);

  return {
    unreadAnnouncements,
    unreadDocuments,
    unreadGarageListings,
    markAsViewed
  };
}
