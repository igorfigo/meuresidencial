
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getCondominiumByMatricula, saveCondominiumData, getCondominiumChangeLogs } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { formatCnpj, formatCep, formatPhone, formatCurrencyInput } from '@/utils/currency';

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
  senha: string;
  confirmarSenha: string;
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
      senha: '',
      confirmarSenha: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      form.setValue(name as keyof FormFields, formatCnpj(value));
    } else if (name === 'cep') {
      form.setValue(name as keyof FormFields, formatCep(value));
    } else if (name === 'telefoneLegal') {
      form.setValue(name as keyof FormFields, formatPhone(value));
    } else if (name === 'desconto') {
      const formattedValue = formatCurrencyInput(value);
      form.setValue(name as keyof FormFields, `R$ ${formattedValue}`);
    } else {
      form.setValue(name as keyof FormFields, value);
    }
  };

  const loadChangeLogs = async (matricula: string) => {
    setIsLoadingLogs(true);
    try {
      const logs = await getCondominiumChangeLogs(matricula);
      setChangeLogs(logs);
      setFilteredChangeLogs(logs);
      setTotalPages(Math.ceil(logs.length / ITEMS_PER_PAGE));
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
        form.reset(data);
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
      if (!data.senha) {
        toast.error('Senha é obrigatória para novos cadastros.');
        return;
      }
      
      if (data.senha !== data.confirmarSenha) {
        toast.error('As senhas não conferem. Por favor, verifique.');
        return;
      }
    } else if (data.senha || data.confirmarSenha) {
      if (data.senha !== data.confirmarSenha) {
        toast.error('As senhas não conferem. Por favor, verifique.');
        return;
      }
    }

    const formattedData = {
      ...data,
      valorPlano: data.valorPlano.replace(',', '.'),
      desconto: data.desconto.replace(',', '.'),
      valorMensal: data.valorMensal.replace(',', '.')
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
    getPageNumbers
  };
};
