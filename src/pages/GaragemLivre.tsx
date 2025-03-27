
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Parking, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useGaragemLivre } from '@/hooks/use-garagem-livre';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GaragemLivre = () => {
  const { user } = useApp();
  const isMobile = useIsMobile();
  const { garagens, isLoading, addGaragem, deleteGaragem } = useGaragemLivre();

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    observacoes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.descricao || !formData.valor) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    try {
      await addGaragem({
        ...formData,
        nome_completo: user?.nome || '',
        telefone: user?.telefone || '',
        email: user?.email || '',
        unidade: user?.unit || '',
      });

      toast.success('Garagem cadastrada com sucesso!');
      setFormData({
        descricao: '',
        valor: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao cadastrar garagem:', error);
      toast.error('Erro ao cadastrar garagem. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGaragem(id);
      toast.success('Garagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover garagem:', error);
      toast.error('Erro ao remover garagem. Tente novamente.');
    }
  };

  // Check if user is a resident
  if (!user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Garagem Livre</h1>
          <Separator className="mb-4" />
          <Alert className="border-amber-300 bg-amber-50">
            <AlertDescription>
              Esta funcionalidade está disponível apenas para moradores do condomínio.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Garagem Livre</h1>
        <Separator className="mb-2" />
        <p className="text-muted-foreground mb-6">
          Cadastre sua vaga de garagem disponível para aluguel no condomínio.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-t-4 border-t-purple-600 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-purple-700">Nova Garagem Disponível</CardTitle>
              <CardDescription>
                Preencha os dados da sua vaga de garagem disponível para aluguel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} id="garagem-form" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_completo" className="font-medium">Nome Completo</Label>
                      <Input 
                        id="nome_completo" 
                        value={user?.nome || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="font-medium">Telefone</Label>
                      <Input 
                        id="telefone" 
                        value={user?.telefone || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidade" className="font-medium">Unidade</Label>
                      <Input 
                        id="unidade" 
                        value={user?.unit || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao" className="font-medium">Descrição da Garagem *</Label>
                      <Input 
                        id="descricao" 
                        name="descricao" 
                        value={formData.descricao} 
                        onChange={handleChange} 
                        placeholder="Ex: Vaga coberta nº 15" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor" className="font-medium">Valor Mensal (R$) *</Label>
                      <Input 
                        id="valor" 
                        name="valor" 
                        value={formData.valor} 
                        onChange={handleChange} 
                        placeholder="Ex: 200,00" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="font-medium">Observações</Label>
                    <Textarea 
                      id="observacoes" 
                      name="observacoes" 
                      value={formData.observacoes} 
                      onChange={handleChange} 
                      placeholder="Informe detalhes adicionais sobre a garagem..." 
                      rows={3} 
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-3 pt-2`}>
              <Button 
                form="garagem-form"
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Garagem
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Parking className="h-5 w-5 mr-2 text-purple-600" />
                Minhas Garagens Disponíveis
              </CardTitle>
              <CardDescription>
                Gerencie as suas garagens disponíveis para aluguel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Carregando garagens...
                </div>
              ) : garagens.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Você ainda não cadastrou nenhuma garagem disponível.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor Mensal</TableHead>
                        <TableHead className="hidden md:table-cell">Observações</TableHead>
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {garagens.map((garagem) => (
                        <TableRow key={garagem.id}>
                          <TableCell className="font-medium">{garagem.descricao}</TableCell>
                          <TableCell>R$ {garagem.valor}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {garagem.observacoes || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(garagem.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GaragemLivre;
