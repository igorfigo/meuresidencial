import { supabase } from './supabaseClient';

export const getCondominiumByMatricula = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('condominiums')
      .select('*')
      .eq('matricula', matricula)
      .single();

    if (error) {
      console.error('Error fetching condominium by matricula:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching condominium by matricula:', error);
    return null;
  }
};

export const getCondominiumChangeLogs = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('condominium_change_logs')
      .select('*')
      .eq('matricula', matricula)
      .order('data_alteracao', { ascending: false });

    if (error) {
      console.error('Error fetching change logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching change logs:', error);
    return [];
  }
};

const createCondominiumChangeLogs = async (
  oldData: Record<string, any>,
  newData: Record<string, any>,
  userEmail: string
) => {
  const changes = [];

  for (const key in newData) {
    if (key in oldData) {
      if (newData[key] !== oldData[key]) {
        changes.push({
          matricula: newData.matricula,
          campo: key,
          valor_anterior: oldData[key] !== null ? String(oldData[key]) : null,
          valor_novo: newData[key] !== null ? String(newData[key]) : null,
          data_alteracao: new Date().toISOString(),
          usuario: userEmail,
        });
      }
    }
  }

  if (changes.length > 0) {
    try {
      const { error } = await supabase
        .from('condominium_change_logs')
        .insert(changes);

      if (error) {
        console.error('Error creating change logs:', error);
      }
    } catch (error) {
      console.error('Error creating change logs:', error);
    }
  }
};

export const saveCondominiumData = async (
  data: Record<string, any>,
  userEmail: string | null = null,
  isUpdate = false
) => {
  try {
    let result;
    
    // Check if a record with this matricula already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('condominiums')
      .select('*')
      .eq('matricula', data.matricula)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingData) {
      // It's an update - exclude matricula from update data
      const updateData = { ...data };
      const matricula = updateData.matricula; // Store matricula for where clause
      
      // Update the record
      result = await supabase
        .from('condominiums')
        .update(updateData)
        .eq('matricula', matricula);
    } else {
      // It's a new insertion
      result = await supabase
        .from('condominiums')
        .insert(data);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Create change logs for existing record
    if (existingData && userEmail) {
      await createCondominiumChangeLogs(existingData, data, userEmail);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving condominium data:', error);
    throw error;
  }
};
