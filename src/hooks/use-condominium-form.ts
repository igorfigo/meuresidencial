
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getCondominiumByMatricula, saveCondominiumData, getCondominiumChangeLogs } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { BRLToNumber, formatToBRL } from '@/utils/currency';

export type FormFields = {
  matricula: string;
  cnpj: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  nomeCondominio: string;
  nomeLegal: string;
  emailLegal: string;
  telefoneLegal: string;
  enderecoLegal: string;
  banco: string;
  agencia: string;
  conta: string;
  pix: string;
  planoContratado: string;
  valorPlano: string;
  formaPagamento: string;
  vencimento: string;
  desconto: string;
  valorMensal: string;
  tipoDocumento: string;
  senha: string;
  confirmarSenha: string;
  ativo: boolean;
};

export type ChangeLogEntry = {
  id: string;
  matricula: string;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: string | null;
};

export const useCondominiumForm = () => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matriculaSearch, setMatriculaSearch] = useState('');
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([]);
  const [filteredChangeLogs, setFilteredChangeLogs] = useState<ChangeLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const form = useForm<FormFields>({
    defaultValues: {
      matricula: '',
      cnpj: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      nomeCondominio: '',
      nomeLegal: '',
      emailLegal: '',
      telefoneLegal: '',
      enderecoLegal: '',
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      planoContratado: 'STANDARD',
      valorPlano: '',
      formaPagamento: 'pix',
      vencimento: '',
      desconto: '',
      valorMensal: '',
      tipoDocumento: 'recibo',
      senha: '',
      confirmarSenha: '',
      ativo: true
    }
  });

  // Format values when form data changes
  useEffect(() => {
    // Watch for changes in valorPlano and desconto
    const subscription = form.watch((value, { name }) => {
      if (name === 'valorPlano' || name === 'desconto') {
        calculateValorMensal();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate valor mensal based on valorPlano and desconto
  const calculateValorMensal = () => {
    const valorPlano = BRLToNumber(form.getValues('valorPlano') || '0');
    const desconto = BRLToNumber(form.getValues('desconto') || '0');
    
    const valorMensal = Math.max(0, valorPlano - desconto);
    
    form.setValue('valorMensal', formatToBRL(valorMensal));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format currency fields
    if (name === 'valorPlano' || name === 'desconto') {
      // Format to BRL
      const formattedValue = formatToBRL(BRLToNumber(value));
      form.setValue(name as keyof FormFields, formattedValue);
      
      // Recalculate valorMensal
      calculateValorMensal();
    } else {
      // Regular form fields
      form.setValue(name as keyof FormFields, value);
    }
  };

  const toggleAtivoStatus = () => {
    const currentStatus = form.watch('ativo');
    form.setValue('ativo', !currentStatus);
  };

  const loadChangeLogs = async (matricula: string) => {
    setIsLoadingLogs(true);
    try {
      const logs = await getCondominiumChangeLogs(matricula);
      setChangeLogs(logs || []);
      setFilteredChangeLogs(logs || []);
      setTotalPages(Math.ceil((logs?.length || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error loading change logs:', error);
      toast.error('Erro ao carregar histórico de alterações.');
      setChangeLogs([]);
      setFilteredChangeLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleMatriculaSearch = async () => {
    if (!matriculaSearch) {
      toast.error('Por favor, digite uma matrícula para buscar.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await getCondominiumByMatricula(matriculaSearch);
      if (data) {
        // Format currency values before setting form data
        const formattedData = {
          ...data,
          valorPlano: data.valorPlano ? formatToBRL(Number(data.valorPlano)) : '',
          desconto: data.desconto ? formatToBRL(Number(data.desconto)) : '',
          valorMensal: data.valorMensal ? formatToBRL(Number(data.valorMensal)) : '',
          // Reset password fields to empty strings
          senha: '',
          confirmarSenha: ''
        };
        
        form.reset(formattedData);
        setIsExistingRecord(true);
        await loadChangeLogs(matriculaSearch);
        toast.success('Dados encontrados com sucesso!');
      } else {
        toast.error('Nenhum registro encontrado para esta matrícula.');
        form.reset();
        setIsExistingRecord(false);
        setFilteredChangeLogs([]);
      }
    } catch (error) {
      console.error('Error searching matricula:', error);
      toast.error('Erro ao buscar dados. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: FormFields) => {
    if (!isExistingRecord) {
      // For new records, password is required
      if (!data.senha) {
        toast.error('Senha é obrigatória para novos cadastros.');
        return;
      }
      
      if (data.senha !== data.confirmarSenha) {
        toast.error('As senhas não conferem. Por favor, verifique.');
        return;
      }
    } else if (data.senha || data.confirmarSenha) {
      // For existing records, if any password field is filled, both must match
      if (data.senha !== data.confirmarSenha) {
        toast.error('As senhas não conferem. Por favor, verifique.');
        return;
      }
    }
    // For existing records with empty password fields, no validation needed

    const formattedData = {
      ...data,
      valorPlano: BRLToNumber(data.valorPlano).toString(),
      desconto: BRLToNumber(data.desconto).toString(),
      valorMensal: BRLToNumber(data.valorMensal).toString()
    };

    setIsSubmitting(true);
    try {
      const userEmail = user ? user.email : null;
      
      await saveCondominiumData(formattedData, userEmail);
      toast.success(isExistingRecord ? 'Cadastro atualizado com sucesso!' : 'Cadastro realizado com sucesso!');
      
      if (matriculaSearch === data.matricula) {
        await loadChangeLogs(data.matricula);
      }
      
      if (!isExistingRecord) {
        form.reset();
        setIsExistingRecord(false);
      } else {
        // For existing records, reset the password fields after successful update
        form.setValue('senha', '');
        form.setValue('confirmarSenha', '');
      }
    } catch (error) {
      console.error('Error saving condominium data:', error);
      toast.error('Erro ao salvar dados. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChangeLogs.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return {
    form,
    isSubmitting,
    isSearching,
    matriculaSearch,
    setMatriculaSearch,
    isExistingRecord,
    changeLogs,
    isLoadingLogs,
    currentPage,
    totalPages,
    handleInputChange,
    handleMatriculaSearch,
    onSubmit,
    getCurrentItems,
    handlePageChange,
    getPageNumbers,
    toggleAtivoStatus
  };
};
