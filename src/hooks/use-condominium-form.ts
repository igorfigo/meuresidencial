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

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'valorPlano' || name === 'desconto') {
        calculateValorMensal();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const calculateValorMensal = () => {
    const valorPlano = BRLToNumber(form.getValues('valorPlano') || '0');
    const desconto = BRLToNumber(form.getValues('desconto') || '0');
    
    const valorMensal = Math.max(0, valorPlano - desconto);
    
    form.setValue('valorMensal', `R$ ${formatToBRL(valorMensal)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valorPlano' || name === 'desconto' || name === 'valorMensal') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = formatCurrencyInput(numericValue);
      form.setValue(name as keyof FormFields, `R$ ${formattedValue}`);
      
      if (name !== 'valorMensal') {
        calculateValorMensal();
      }
    } else {
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
        const formattedData = {
          matricula: data.matricula,
          cnpj: data.cnpj || '',
          cep: data.cep || '',
          rua: data.rua || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          nomeCondominio: data.nomecondominio || '',
          nomeLegal: data.nomelegal || '',
          emailLegal: data.emaillegal || '',
          telefoneLegal: data.telefonelegal || '',
          enderecoLegal: data.enderecolegal || '',
          planoContratado: data.planocontratado || 'STANDARD',
          valorPlano: data.valorplano ? `R$ ${formatToBRL(Number(data.valorplano))}` : 'R$ 0,00',
          formaPagamento: data.formapagamento || 'pix',
          vencimento: data.vencimento || '',
          desconto: data.desconto ? `R$ ${formatToBRL(Number(data.desconto))}` : 'R$ 0,00',
          valorMensal: data.valormensal ? `R$ ${formatToBRL(Number(data.valormensal))}` : 'R$ 0,00',
          tipoDocumento: data.tipodocumento || 'recibo',
          senha: '',
          confirmarSenha: '',
          ativo: data.ativo !== null ? data.ativo : true
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

    // Create base formatted data without password fields
    const formattedData: Record<string, any> = {
      matricula: data.matricula,
      cnpj: data.cnpj,
      cep: data.cep,
      rua: data.rua,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      nomecondominio: data.nomeCondominio,
      nomelegal: data.nomeLegal,
      emaillegal: data.emailLegal,
      telefonelegal: data.telefoneLegal,
      enderecolegal: data.enderecoLegal,
      planocontratado: data.planoContratado,
      valorplano: BRLToNumber(data.valorPlano).toString(),
      formapagamento: data.formaPagamento,
      vencimento: data.vencimento,
      desconto: BRLToNumber(data.desconto).toString(),
      valormensal: BRLToNumber(data.valorMensal).toString(),
      tipodocumento: data.tipoDocumento,
      ativo: data.ativo
    };

    // Only include password fields if they are filled
    if (data.senha && data.confirmarSenha) {
      formattedData.senha = data.senha;
      formattedData.confirmarsenha = data.confirmarSenha;
    }

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

const formatCurrencyInput = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  return formatToBRL(Number(numericValue));
};
