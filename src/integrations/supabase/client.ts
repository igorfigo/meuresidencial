
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

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

export const checkCondominiumExists = async (matricula: string, cnpj: string, emailLegal: string) => {
  try {
    const { data: matriculaData, error: matriculaError } = await supabase
      .from('condominiums')
      .select('matricula')
      .eq('matricula', matricula);

    if (matriculaError) {
      console.error('Error checking matricula existence:', matriculaError);
      throw matriculaError;
    }

    const matriculaExists = matriculaData && matriculaData.length > 0;

    let cnpjExists = false;
    if (cnpj) {
      const { data: cnpjData, error: cnpjError } = await supabase
        .from('condominiums')
        .select('cnpj')
        .eq('cnpj', cnpj);

      if (cnpjError) {
        console.error('Error checking CNPJ existence:', cnpjError);
        throw cnpjError;
      }

      cnpjExists = cnpjData && cnpjData.length > 0;
    }

    const { data: emailData, error: emailError } = await supabase
      .from('condominiums')
      .select('emaillegal')
      .eq('emaillegal', emailLegal);

    if (emailError) {
      console.error('Error checking email existence:', emailError);
      throw emailError;
    }

    const emailExists = emailData && emailData.length > 0;

    return {
      matriculaExists,
      cnpjExists,
      emailExists,
    };
  } catch (error) {
    console.error('Error checking condominium existence:', error);
    return {
      matriculaExists: false,
      cnpjExists: false,
      emailExists: false,
    };
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

    return data;
  } catch (error) {
    console.error('Error fetching change logs:', error);
    return [];
  }
};

const logCondominiumChanges = async (matricula: string, newData: any, userEmail: string | null) => {
  try {
    const existingData = await getCondominiumByMatricula(matricula);

    if (!existingData) {
      console.warn(`No existing data found for matricula ${matricula}. Skipping change log.`);
      return;
    }

    const changes = [];

    for (const key in newData) {
      if (key === 'senha' || key === 'confirmarsenha') continue;

      const oldValue = existingData[key];
      const newValue = newData[key];

      if (oldValue !== newValue) {
        changes.push({
          matricula: matricula,
          campo: key,
          valor_anterior: oldValue !== null ? String(oldValue) : null,
          valor_novo: newValue !== null ? String(newValue) : null,
          data_alteracao: new Date().toISOString(),
          usuario: userEmail,
        });
      }
    }

    if (changes.length > 0) {
      const { error } = await supabase
        .from('condominium_change_logs')
        .insert(changes);

      if (error) {
        console.error('Error logging changes to Supabase:', error);
      }
    } else {
      console.log('No changes to log.');
    }
  } catch (error) {
    console.error('Error logging condominium changes:', error);
  }
};

export const saveCondominiumData = async (data: any, userEmail: string | null, isUpdate = false) => {
  try {
    // Check if we're updating an existing record or creating a new one
    if (isUpdate) {
      // Update the existing record where matricula matches
      const { error } = await supabase
        .from('condominiums')
        .update({
          cnpj: data.cnpj,
          cep: data.cep,
          rua: data.rua,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          nomecondominio: data.nomecondominio,
          nomelegal: data.nomelegal,
          emaillegal: data.emaillegal,
          telefonelegal: data.telefonelegal,
          enderecolegal: data.enderecolegal,
          planocontratado: data.planocontratado,
          valorplano: data.valorplano,
          formapagamento: data.formapagamento,
          vencimento: data.vencimento,
          desconto: data.desconto,
          valormensal: data.valormensal,
          tipodocumento: data.tipodocumento,
          ativo: data.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('matricula', data.matricula);

      if (error) throw error;

      // If password is provided, update the password separately
      if (data.senha) {
        const { error: pwdError } = await supabase
          .from('condominiums')
          .update({
            senha: data.senha,
            confirmarsenha: data.confirmarsenha,
          })
          .eq('matricula', data.matricula);

        if (pwdError) throw pwdError;
      }
    } else {
      // Insert a new record
      const { error } = await supabase
        .from('condominiums')
        .insert([data]);

      if (error) throw error;
    }

    // Log the changes for either update or new record
    await logCondominiumChanges(data.matricula, data, userEmail);

    return { success: true };
  } catch (error) {
    console.error('Error saving condominium data:', error);
    throw error;
  }
};

// Add the missing functions below

// Balance adjustments
export const getBalanceAdjustments = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('balance_adjustments')
      .select('*')
      .eq('matricula', matricula)
      .order('adjustment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching balance adjustments:', error);
    return [];
  }
};

// Announcements
export const getAnnouncements = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('matricula', matricula)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const getAnnouncementById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching announcement by id:', error);
    return null;
  }
};

export const saveAnnouncement = async (announcement: any) => {
  try {
    if (announcement.id) {
      // Update existing announcement
      const { error } = await supabase
        .from('announcements')
        .update(announcement)
        .eq('id', announcement.id);

      if (error) throw error;
      return { success: true, id: announcement.id };
    } else {
      // Create new announcement
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select();

      if (error) throw error;
      return { success: true, id: data?.[0]?.id };
    }
  } catch (error) {
    console.error('Error saving announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Business expenses
export const getBusinessExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('business_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching business expenses:', error);
    return [];
  }
};

export const saveBusinessExpense = async (expense: any) => {
  try {
    const { data, error } = await supabase
      .from('business_expenses')
      .insert([expense])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving business expense:', error);
    throw error;
  }
};

export const updateBusinessExpense = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('business_expenses')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error updating business expense:', error);
    throw error;
  }
};

export const deleteBusinessExpense = async (id: string) => {
  try {
    const { error } = await supabase
      .from('business_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting business expense:', error);
    throw error;
  }
};

// Finances
export const getFinancialIncomes = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('financial_incomes')
      .select('*')
      .eq('matricula', matricula)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching financial incomes:', error);
    return [];
  }
};

export const getFinancialExpenses = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('financial_expenses')
      .select('*')
      .eq('matricula', matricula)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching financial expenses:', error);
    return [];
  }
};

export const getFinancialBalance = async (matricula: string) => {
  try {
    const { data, error } = await supabase
      .from('financial_balance')
      .select('*')
      .eq('matricula', matricula)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error code
      throw error;
    }

    return data || { balance: '0', matricula };
  } catch (error) {
    console.error('Error fetching financial balance:', error);
    return { balance: '0', matricula };
  }
};

export const saveFinancialIncome = async (income: any) => {
  try {
    const { data, error } = await supabase
      .from('financial_incomes')
      .insert([income])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving financial income:', error);
    throw error;
  }
};

export const saveFinancialExpense = async (expense: any) => {
  try {
    const { data, error } = await supabase
      .from('financial_expenses')
      .insert([expense])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving financial expense:', error);
    throw error;
  }
};

export const deleteFinancialIncome = async (id: string) => {
  try {
    const { error } = await supabase
      .from('financial_incomes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting financial income:', error);
    throw error;
  }
};

export const deleteFinancialExpense = async (id: string) => {
  try {
    const { error } = await supabase
      .from('financial_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting financial expense:', error);
    throw error;
  }
};

export const updateFinancialBalance = async (matricula: string, balance: string, observations?: string) => {
  try {
    // First get the current balance
    const currentBalance = await getFinancialBalance(matricula);
    const currentBalanceValue = currentBalance?.balance || '0';

    // Check if a record exists for this matricula
    if (currentBalance && 'id' in currentBalance) {
      // Update existing balance
      const { error } = await supabase
        .from('financial_balance')
        .update({ balance, updated_at: new Date().toISOString(), is_manual: true })
        .eq('matricula', matricula);

      if (error) throw error;
    } else {
      // Create new balance record
      const { error } = await supabase
        .from('financial_balance')
        .insert([{
          matricula,
          balance,
          is_manual: true
        }]);

      if (error) throw error;
    }

    // Log the balance adjustment
    const { error: logError } = await supabase
      .from('balance_adjustments')
      .insert([{
        matricula,
        previous_balance: currentBalanceValue,
        new_balance: balance,
        observations,
        adjustment_date: new Date().toISOString()
      }]);

    if (logError) {
      console.error('Error logging balance adjustment:', logError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating financial balance:', error);
    throw error;
  }
};

// PIX key functions
export const getPixKey = async () => {
  try {
    const { data, error } = await supabase
      .from('pix_keys')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error code
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching PIX key:', error);
    return null;
  }
};

export const savePixKey = async (pixKey: any) => {
  try {
    if (pixKey.id) {
      // Update existing PIX key
      const { error } = await supabase
        .from('pix_keys')
        .update({
          tipochave: pixKey.tipochave,
          chavepix: pixKey.chavepix,
          jurosaodia: pixKey.jurosaodia,
          updated_at: new Date().toISOString()
        })
        .eq('id', pixKey.id);

      if (error) throw error;
    } else {
      // Create new PIX key
      const { error } = await supabase
        .from('pix_keys')
        .insert([{
          tipochave: pixKey.tipochave,
          chavepix: pixKey.chavepix,
          jurosaodia: pixKey.jurosaodia
        }]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving PIX key:', error);
    throw error;
  }
};

export const deletePixKey = async (id: string) => {
  try {
    const { error } = await supabase
      .from('pix_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting PIX key:', error);
    throw error;
  }
};
