
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Save, Search } from 'lucide-react';
import { fetchAddressByCep } from '@/services/cepService';

const CadastroGestor = () => {
  const [formData, setFormData] = useState({
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
    
    // Plano / Contrato
    planoContratado: '',
    valorPlano: '',
    formaPagamento: '',
    vencimento: '',
    desconto: '',
    valorMensal: '',
    
    // Segurança
    senha: '',
    confirmarSenha: ''
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute matricula whenever CEP or number changes
  useEffect(() => {
    if (formData.cep && formData.numero) {
      const cleanCep = formData.cep.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        matricula: `${cleanCep}${formData.numero}`
      }));
    }
  }, [formData.cep, formData.numero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepSearch = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error('CEP inválido. Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsLoadingCep(true);
    try {
      const addressData = await fetchAddressByCep(cep);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          rua: addressData.logradouro,
          bairro: addressData.bairro,
          cidade: addressData.localidade,
          estado: addressData.uf
        }));
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

  const calculateValorMensal = () => {
    const valorPlano = parseFloat(formData.valorPlano) || 0;
    const desconto = parseFloat(formData.desconto) || 0;
    const valorMensal = (valorPlano - desconto).toFixed(2);
    
    setFormData(prev => ({ ...prev, valorMensal }));
  };

  useEffect(() => {
    calculateValorMensal();
  }, [formData.valorPlano, formData.desconto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não conferem. Por favor, verifique.');
      return;
    }

    // Check for required fields (simplified validation)
    const requiredFields = [
      'cnpj', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'nomeCondominio',
      'nomeLegal', 'emailLegal', 'telefoneLegal', 'planoContratado', 'valorPlano',
      'formaPagamento', 'vencimento', 'senha'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Cadastro realizado com sucesso!');
      setIsSubmitting(false);
      // In a real app, you would redirect or clear the form here
    }, 1500);
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

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          {/* Informações Condomínio */}
          <Card className="form-section">
            <h2 className="form-section-title">Informações Condomínio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
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
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCnpj(e.target.value) }))}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: formatCep(e.target.value) }))}
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
                  value={formData.nomeCondominio}
                  onChange={handleChange}
                  placeholder="Nome do Condomínio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  placeholder="Rua / Avenida"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Número"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="Estado"
                />
              </div>
            </div>
          </Card>

          {/* Informações Representante Legal */}
          <Card className="form-section">
            <h2 className="form-section-title">Informações Representante Legal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeLegal">Nome Completo</Label>
                <Input
                  id="nomeLegal"
                  name="nomeLegal"
                  value={formData.nomeLegal}
                  onChange={handleChange}
                  placeholder="Nome completo do representante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailLegal">E-mail</Label>
                <Input
                  id="emailLegal"
                  name="emailLegal"
                  type="email"
                  value={formData.emailLegal}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefoneLegal">Número de Telefone</Label>
                <Input
                  id="telefoneLegal"
                  name="telefoneLegal"
                  value={formData.telefoneLegal}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefoneLegal: formatPhone(e.target.value) }))}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoLegal">Endereço Residencial</Label>
                <Input
                  id="enderecoLegal"
                  name="enderecoLegal"
                  value={formData.enderecoLegal}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </Card>

          {/* Informações Financeiras */}
          <Card className="form-section">
            <h2 className="form-section-title">Informações Financeiras</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  placeholder="Nome do banco"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  name="agencia"
                  value={formData.agencia}
                  onChange={handleChange}
                  placeholder="Número da agência"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  name="conta"
                  value={formData.conta}
                  onChange={handleChange}
                  placeholder="Número da conta"
                />
              </div>
            </div>
          </Card>

          {/* Plano / Contrato */}
          <Card className="form-section">
            <h2 className="form-section-title">Plano / Contrato</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planoContratado">Plano Contratado</Label>
                <Select 
                  value={formData.planoContratado}
                  onValueChange={(value) => handleSelectChange('planoContratado', value)}
                >
                  <SelectTrigger id="planoContratado">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="basico">Plano Básico</SelectItem>
                      <SelectItem value="standard">Plano Standard</SelectItem>
                      <SelectItem value="premium">Plano Premium</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
                <Input
                  id="valorPlano"
                  name="valorPlano"
                  type="number"
                  value={formData.valorPlano}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select 
                  value={formData.formaPagamento}
                  onValueChange={(value) => handleSelectChange('formaPagamento', value)}
                >
                  <SelectTrigger id="formaPagamento">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="boleto">Boleto Bancário</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vencimento">Vencimento</Label>
                <Select 
                  value={formData.vencimento}
                  onValueChange={(value) => handleSelectChange('vencimento', value)}
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
                  value={formData.desconto}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  name="valorMensal"
                  value={formData.valorMensal}
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
          <Card className="form-section">
            <h2 className="form-section-title">Segurança</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite uma senha segura"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
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
