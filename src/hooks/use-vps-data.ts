import { useState, useEffect } from 'react';

// Keep a minimal interface structure for potential future use
export interface ResourceData {
  name: string;
  value: number;
  type: string;
}

export const useVpsData = () => {
  const [data, setData] = useState<null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This hook has been deprecated as VPS monitoring is no longer needed
  useEffect(() => {
    console.log('VPS monitoring has been disabled');
    setLoading(false);
    setData(null);
    setError(null);
  }, []);

  return { 
    data, 
    loading, 
    error,
    isMockData: false,
    errorDetails: null
  };
};
