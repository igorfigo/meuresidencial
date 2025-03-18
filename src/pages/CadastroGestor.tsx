import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Save, Search, History } from 'lucide-react';
import { fetchAddressByCep } from '@/services/cepService';
import { useForm } from 'react-hook-form';
import { saveCondominiumData, getCondominiumByMatricula, getCondominiumChangeLogs } from '@/integrations/supabase/client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useApp } from '@/contexts/AppContext';
import { usePlans } from '@/hooks/use-plans';
import { formatToBRL, BRLToNumber, formatCurrencyInput } from '@/utils/currency';

type FormFields = {
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

type ChangeLogEntry = {
  id: string;
  matricula: string;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: string | null;
};

const CadastroGestor = () => {
  const { user } = useApp();
  const { plans, isLoading: isLoadingPlans, getPlanValue } = usePlans();
  const [isLoadingCep, setIsLoadingCep] = useState(false);
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

  const { watch, setValue, register, reset, handleSubmit } = form;
  
  const cep = watch('cep');
  const numero = watch('numero');
  const planoContratado = watch('planoContratado');
  const desconto = watch('desconto');
  
  useEffect(() => {
    if (cep && numero) {
      const cleanCep = cep.replace(/\D/g, '');
      setValue('matricula', `${cleanCep}${numero}`);
    }
  }, [cep, numero, setValue]);

  useEffect(() => {
    if (planoContratado) {
      const valor = getPlanValue(planoContratado);
      setValue('valorPlano', valor);
    }
  }, [planoContratado, plans, setValue, getPlanValue]);

  useEffect(() => {
    const valorPlano = watch('valorPlano');
    const descontoValue = watch('desconto');
    
    // Convert currency strings to numbers for calculation
    const planoNumber = BRLToNumber(valorPlano);
    const descontoNumber = BRLToNumber(descontoValue);
    
    // Calculate valor mensal and format back to currency
    const valorMensal = formatToBRL(Math.max(0, planoNumber - descontoNumber));
    
    setValue('valorMensal', valorMensal);
  }, [watch('valorPlano'), watch('desconto'), setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      setValue(name as keyof FormFields, formatCnpj(value));
    } else if (name === 'cep') {
      setValue(name as keyof FormFields, formatCep(value));
    } else if (name === 'telefoneLegal') {
      setValue(name as keyof FormFields, formatPhone(value));
    } else if (name === 'desconto') {
      // Format the discount input as currency
      const formattedValue = formatCurrencyInput(value);
      setValue(name as keyof FormFields, `R$ ${formattedValue}`);
    } else {
      setValue(name as keyof FormFields, value);
    }
  };

  const bancos = [
    "Itaú Unibanco",
    "Banco do Brasil",
    "Bradesco",
    "Caixa Econômica Federal",
    "Santander Brasil",
    "BTG Pactual",
    "Banco Safra",
    "Sicredi",
    "Sicoob",
    "Citibank"
  ];

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
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
        reset();
        setIsExistingRecord(false);
      }
    } catch (error) {
      console.error('Error saving condominium data:', error);
      toast.error('Erro ao salvar dados. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const formatCurrency = (value: string) => {
    let formattedValue = value.replace(/[^\d,]/g, '');
    
    if (formattedValue.includes(',')) {
      let [integerPart, decimalPart] = formattedValue.split(',');
      
      if (decimalPart.length > 2) {
        integerPart = integerPart + decimalPart.slice(0, decimalPart.length - 2);
        decimalPart = decimalPart.slice(decimalPart.length - 2);
      } else if (decimalPart.length < 2) {
        decimalPart = decimalPart.padEnd(2, '0');
      }
      
      return `${integerPart || '0'},${decimalPart}`;
    } else {
      return `${formattedValue || '0'},00`;
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <Building className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Cadastro Gestor</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie as informações do condomínio e do representante legal.
          </p>
        </header>

        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="matriculaSearch">Buscar por Matrícula</Label>
              <div className="flex space-x-2 mt-1">
                <Input 
                  id="matriculaSearch" 
                  placeholder="Digite a matrícula para buscar" 
                  value={matriculaSearch}
                  onChange={(e) => setMatriculaSearch(e.target.value)}
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  onClick={handleMatriculaSearch} 
                  disabled={isSearching} 
                  className="bg-brand-600 hover:bg-brand-700">
                  {isSearching ? "Buscando..." : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="form-section p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Condomínio</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    {...register('matricula')}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este campo é gerado automaticamente após preencher CEP e Número.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    {...register('cnpj')}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="cep"
                      {...register('cep')}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleCepSearch}
                      disabled={isLoadingCep}
                      className="bg-brand-600 hover:bg-brand-700"
                    >
                      {isLoadingCep ? "Buscando..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeCondominio">Nome do Condomínio</Label>
                  <Input
                    id="nomeCondominio"
                    {...register('nomeCondominio')}
                    onChange={handleInputChange}
                    placeholder="Nome do Condomínio"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    {...register('rua')}
                    onChange={handleInputChange}
                    placeholder="Rua / Avenida"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    {...register('numero')}
                    onChange={handleInputChange}
                    placeholder="Número"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    {...register('complemento')}
                    onChange={handleInputChange}
                    placeholder="Complemento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    {...register('bairro')}
                    onChange={handleInputChange}
                    placeholder="Bairro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    {...register('cidade')}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    {...register('estado')}
                    onChange={handleInputChange}
                    placeholder="Estado"
                  />
                </div>
              </div>
            </Card>

            <Card className="form-section p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Representante Legal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeLegal">Nome Completo</Label>
                  <Input
                    id="nomeLegal"
                    {...register('nomeLegal')}
                    onChange={handleInputChange}
                    placeholder="Nome completo do representante"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailLegal">E-mail</Label>
                  <Input
                    id="emailLegal"
                    {...register('emailLegal')}
                    type="email"
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefoneLegal">Número de Telefone</Label>
                  <Input
                    id="telefoneLegal"
                    {...register('telefoneLegal')}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enderecoLegal">Endereço Residencial</Label>
                  <Input
                    id="enderecoLegal"
                    {...register('enderecoLegal')}
                    onChange={handleInputChange}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </Card>

            <Card className="form-section p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Financeiras</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Select 
                    value={form.watch('banco')}
                    onValueChange={(value) => setValue('banco', value)}
                  >
                    <SelectTrigger id="banco">
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {bancos.map((banco) => (
                          <SelectItem key={banco} value={banco}>
                            {banco}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    {...register('agencia')}
                    onChange={handleInputChange}
                    placeholder="Número da Agência (Somente Números)"
                    numberOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    {...register('conta')}
                    onChange={handleInputChange}
                    placeholder="Número da Conta (Somente Números)"
                    numberOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix">PIX</Label>
                  <Input
                    id="pix"
                    {...register('pix')}
                    onChange={handleInputChange}
                    placeholder="Chave PIX (Somente Números)"
                    numberOnly
                  />
                </div>
              </div>
            </Card>

            <Card className="form-section p-6">
              <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planoContratado">Plano Contratado</Label>
                  <Select 
                    value={form.watch('planoContratado')}
                    onValueChange={(value) => setValue('planoContratado', value)}
                    disabled={isLoadingPlans}
                  >
                    <SelectTrigger id="planoContratado">
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {isLoadingPlans ? (
                          <SelectItem value="loading" disabled>Carregando planos...</SelectItem>
                        ) : plans.length === 0 ? (
                          <SelectItem value="empty" disabled>Nenhum plano disponível</SelectItem>
                        ) : (
                          plans.map((plan) => (
                            <SelectItem key={plan.codigo} value={plan.codigo}>
                              {plan.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
                  <Input
                    id="valorPlano"
                    {...register('valorPlano')}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select 
                    value={form.watch('formaPagamento')}
                    onValueChange={(value) => setValue('formaPagamento', value)}
                  >
                    <SelectTrigger id="formaPagamento">
                      <SelectValue placeholder="Forma de Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vencimento">Vencimento</Label>
                  <Select 
                    value={form.watch('vencimento')}
                    onValueChange={(value) => setValue('vencimento', value)}
                  >
                    <SelectTrigger id="vencimento">
                      <SelectValue placeholder="Vencimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input
                    id="desconto"
                    {...register('desconto')}
                    onChange={handleInputChange}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                  <Input
                    id="valorMensal"
                    {...register('valorMensal')}
                    readOnly
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor do plano menos o desconto.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="form-section p-6">
              <h2 className="text-xl font-semibold mb-4">Segurança</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">
                    Senha {!isExistingRecord && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="senha"
                    {...register('senha')}
                    type="password"
                    onChange={handleInputChange}
                    placeholder={isExistingRecord ? "Digite para alterar a senha (opcional)" : "Digite uma senha segura"}
                    required={!isExistingRecord}
                  />
                  {isExistingRecord && (
                    <p className="text-xs text-muted-foreground">
                      Preencha apenas se desejar alterar a senha.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">
                    Confirmar Senha {!isExistingRecord && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="confirmarSenha"
                    {...register('confirmarSenha')}
                    type="password"
                    onChange={handleInputChange}
                    placeholder={isExistingRecord ? "Confirme a nova senha (opcional)" : "Confirme sua senha"}
                    required={!isExistingRecord}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-brand-600 hover:bg-brand-700"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : (isExistingRecord ? 'Atualizar Cadastro' : 'Salvar Cadastro')}
              </Button>
            </div>
          </form>
        </Form>
        
        {filteredChangeLogs.length > 0 && (
          <Card className="mt-8 mb-8 p-6">
            <div className="flex items-center mb-4">
              <History className="h-5 w-5 mr-2 text-brand-600" />
              <h2 className="text-xl font-semibold">Histórico de Alterações</h2>
            </div>
            
            <Separator className="mb-4" />
            
            <ScrollArea className="h-80 rounded-md border">
              <Table>
                <TableCaption>Histórico de alterações para a matrícula {matriculaSearch}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Anterior</TableHead>
                    <TableHead>Novo Valor</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentItems().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.data_alteracao)}</TableCell>
                      <TableCell className="font-medium">{log.campo}</TableCell>
                      <TableCell>{log.valor_anterior || '-'}</TableCell>
                      <TableCell>{log.valor_novo || '-'}</TableCell>
                      <TableCell>{log.usuario || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }} 
                        />
                      </PaginationItem>
                    )}
                    
                    {getPageNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }} 
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CadastroGestor;
