import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

export const getCondominiumByMatricula = async (matricula: string) => {
  try {
    const supabase = createClient();
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
    const supabase = createClient();

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
    const supabase = createClient();
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
    const supabase = createClient();
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
    const supabase = createClient();
    
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
