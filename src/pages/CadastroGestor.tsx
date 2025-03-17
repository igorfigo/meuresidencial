
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Save, Search } from 'lucide-react';
import { fetchAddressByCep } from '@/services/cepService';
import { useForm } from 'react-hook-form';
import { saveCondominiumData, getCondominiumByMatricula } from '@/integrations/supabase/client';

const CadastroGestor = () => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm({
    defaultValues: {
      // Informações Condomínio
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
      
      // Informações Representante Legal
      nomeLegal: '',
      emailLegal: '',
      telefoneLegal: '',
      enderecoLegal: '',
      
      // Informações Financeiras
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      
      // Plano / Contrato
      planoContratado: 'standard',
      valorPlano: '',
      formaPagamento: 'pix',
      vencimento: '',
      desconto: '',
      valorMensal: '',
      
      // Segurança
      senha: '',
      confirmarSenha: ''
    }
  });

  const { watch, setValue, getValues } = form;
  
  const cep = watch('cep');
  const numero = watch('numero');
  const valorPlano = watch('valorPlano');
  const desconto = watch('desconto');
  
  // Compute matricula whenever CEP or number changes
  useEffect(() => {
    if (cep && numero) {
      const cleanCep = cep.replace(/\D/g, '');
      setValue('matricula', `${cleanCep}${numero}`);
    }
  }, [cep, numero, setValue]);

  // Calculate valorMensal
  useEffect(() => {
    const planoValue = parseFloat(valorPlano) || 0;
    const descontoValue = parseFloat(desconto) || 0;
    const valorMensal = (planoValue - descontoValue).toFixed(2);
    
    setValue('valorMensal', valorMensal);
  }, [valorPlano, desconto, setValue]);

  const handleCepSearch = async () => {
    const cepValue = getValues('cep').replace(/\D/g, '');
    if (cepValue.length !== 8) {
      toast.error('CEP inválido. Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsLoadingCep(true);
    try {
      const addressData = await fetchAddressByCep(cepValue);
      if (addressData) {
        setValue('rua', addressData.logradouro);
        setValue('bairro', addressData.bairro);
        setValue('cidade', addressData.localidade);
        setValue('estado', addressData.uf);
        toast.success('Endereço encontrado com sucesso!');
      } else {
        toast.error('CEP não encontrado. Verifique e tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao buscar endereço. Tente novamente mais tarde.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleMatriculaSearch = async () => {
    const matricula = getValues('matricula');
    if (!matricula) {
      toast.error('Por favor, informe uma matrícula para buscar.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await getCondominiumByMatricula(matricula);
      if (data) {
        // Populate all form fields with the retrieved data
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && form.getValues(key as any) !== undefined) {
            setValue(key as any, value);
          }
        });
        toast.success('Condomínio encontrado com sucesso!');
      } else {
        toast.error('Nenhum condomínio encontrado com esta matrícula.');
      }
    } catch (error) {
      console.error('Error searching for condominium:', error);
      toast.error('Erro ao buscar condomínio. Tente novamente mais tarde.');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: any) => {
    // Validation
    if (data.senha !== data.confirmarSenha) {
      toast.error('As senhas não conferem. Por favor, verifique.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCondominiumData(data);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error) {
      console.error('Error saving condominium data:', error);
      toast.error('Erro ao salvar dados. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format input values
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      setValue('cnpj', formatCnpj(value));
    } else if (name === 'cep') {
      setValue('cep', formatCep(value));
    } else if (name === 'telefoneLegal') {
      setValue('telefoneLegal', formatPhone(value));
    } else {
      setValue(name as any, value);
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

        {/* Search bar */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="matriculaSearch">Buscar por Matrícula</Label>
              <div className="flex space-x-2 mt-1">
                <Input 
                  id="matriculaSearch" 
                  placeholder="Digite a matrícula para buscar" 
                  value={form.getValues('matricula')} 
                  onChange={(e) => setValue('matricula', e.target.value)}
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  onClick={handleMatriculaSearch} 
                  disabled={isSearching} 
                  className="bg-brand-600 hover:bg-brand-700">
                  {isSearching ? "Buscando..." : <Search className="h-4 w-4 mr-2" />}
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
          {/* Informações Condomínio */}
          <Card className="form-section p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Condomínio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  name="matricula"
                  value={form.getValues('matricula')}
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
                  name="cnpj"
                  value={form.getValues('cnpj')}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cep"
                    name="cep"
                    value={form.getValues('cep')}
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
                  name="nomeCondominio"
                  value={form.getValues('nomeCondominio')}
                  onChange={handleInputChange}
                  placeholder="Nome do Condomínio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  name="rua"
                  value={form.getValues('rua')}
                  onChange={handleInputChange}
                  placeholder="Rua / Avenida"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={form.getValues('numero')}
                  onChange={handleInputChange}
                  placeholder="Número"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={form.getValues('complemento')}
                  onChange={handleInputChange}
                  placeholder="Complemento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={form.getValues('bairro')}
                  onChange={handleInputChange}
                  placeholder="Bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={form.getValues('cidade')}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={form.getValues('estado')}
                  onChange={handleInputChange}
                  placeholder="Estado"
                />
              </div>
            </div>
          </Card>

          {/* Informações Representante Legal */}
          <Card className="form-section p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Representante Legal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeLegal">Nome Completo</Label>
                <Input
                  id="nomeLegal"
                  name="nomeLegal"
                  value={form.getValues('nomeLegal')}
                  onChange={handleInputChange}
                  placeholder="Nome completo do representante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailLegal">E-mail</Label>
                <Input
                  id="emailLegal"
                  name="emailLegal"
                  type="email"
                  value={form.getValues('emailLegal')}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefoneLegal">Número de Telefone</Label>
                <Input
                  id="telefoneLegal"
                  name="telefoneLegal"
                  value={form.getValues('telefoneLegal')}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoLegal">Endereço Residencial</Label>
                <Input
                  id="enderecoLegal"
                  name="enderecoLegal"
                  value={form.getValues('enderecoLegal')}
                  onChange={handleInputChange}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </Card>

          {/* Informações Financeiras */}
          <Card className="form-section p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Financeiras</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Select 
                  value={form.getValues('banco')}
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
                  name="agencia"
                  value={form.getValues('agencia')}
                  onChange={handleInputChange}
                  placeholder="Número da agência"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  name="conta"
                  value={form.getValues('conta')}
                  onChange={handleInputChange}
                  placeholder="Número da conta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix">PIX</Label>
                <Input
                  id="pix"
                  name="pix"
                  value={form.getValues('pix')}
                  onChange={handleInputChange}
                  placeholder="Chave PIX"
                />
              </div>
            </div>
          </Card>

          {/* Plano / Contrato */}
          <Card className="form-section p-6">
            <h2 className="text-xl font-semibold mb-4">Plano / Contrato</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planoContratado">Plano Contratado</Label>
                <Input
                  id="planoContratado"
                  value="Plano Standard"
                  readOnly
                  className="bg-gray-100"
                />
                <input type="hidden" name="planoContratado" value="standard" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
                <Input
                  id="valorPlano"
                  name="valorPlano"
                  type="number"
                  value={form.getValues('valorPlano')}
                  onChange={handleInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Input
                  id="formaPagamento"
                  value="PIX"
                  readOnly
                  className="bg-gray-100"
                />
                <input type="hidden" name="formaPagamento" value="pix" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vencimento">Vencimento</Label>
                <Select 
                  value={form.getValues('vencimento')}
                  onValueChange={(value) => setValue('vencimento', value)}
                >
                  <SelectTrigger id="vencimento">
                    <SelectValue placeholder="Dia do vencimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          Dia {day}
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
                  name="desconto"
                  type="number"
                  value={form.getValues('desconto')}
                  onChange={handleInputChange}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  name="valorMensal"
                  value={form.getValues('valorMensal')}
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">
                  Valor do plano menos o desconto.
                </p>
              </div>
            </div>
          </Card>

          {/* Segurança */}
          <Card className="form-section p-6">
            <h2 className="text-xl font-semibold mb-4">Segurança</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={form.getValues('senha')}
                  onChange={handleInputChange}
                  placeholder="Digite uma senha segura"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={form.getValues('confirmarSenha')}
                  onChange={handleInputChange}
                  placeholder="Confirme sua senha"
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
              {isSubmitting ? 'Salvando...' : 'Salvar Cadastro'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CadastroGestor;
