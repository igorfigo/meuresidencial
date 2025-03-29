
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TrackingRoute: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const trackVisit = async () => {
      // First, lookup the source by code
      const { data: source, error: sourceError } = await supabase
        .from('traffic_sources')
        .select('id')
        .eq('unique_code', code)
        .single();
      
      if (sourceError || !source) {
        console.error('Error finding traffic source:', sourceError);
        // Redirect to home page if source not found
        navigate('/');
        return;
      }
      
      // Record the visit
      const { error: visitError } = await supabase
        .from('traffic_visits')
        .insert({
          source_id: source.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
      
      if (visitError) {
        console.error('Error recording visit:', visitError);
      }
      
      // Redirect to home page after recording
      navigate('/');
    };
    
    if (code) {
      trackVisit();
    }
  }, [code, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};

export default TrackingRoute;
