import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { useGarageListings } from '@/hooks/use-garage-listings';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const GaragemLivre = () => {
  const { user } = useApp();
  const { 
    garageListings, 
    myGarageListings, 
    isLoading, 
    addGarageListing, 
    deleteGarageListing 
  } = useGarageListings();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('minhas-vagas');
  
  const handleAddGarageListing = () => {
    if (!description.trim()) return;
    
    addGarageListing.mutate(description, {
      onSuccess: () => {
        setDescription('');
        setIsDialogOpen(false);
      }
    });
  };
  
  const handleDeleteListing = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta vaga?')) {
      deleteGarageListing.mutate(id);
    }
  };

  if (!user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Esta funcionalidade está disponível apenas para moradores.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Garagem Livre</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Cadastrar Vaga
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="minhas-vagas">Minhas Vagas</TabsTrigger>
            <TabsTrigger value="vagas-disponiveis">Vagas Disponíveis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="minhas-vagas">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Vagas Cadastradas</CardTitle>
                <CardDescription>
                  Gerencie as vagas de garagem que você disponibilizou para os demais moradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-6">Carregando...</div>
                ) : myGarageListings && myGarageListings.length > 0 ? (
                  <div className="space-y-4">
                    {myGarageListings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4 relative">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <CarIcon className="h-8 w-8 text-blue-500" />
                            <div>
                              <h3 className="font-medium">
                                Vaga de Garagem - Unidade {user.unit}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {listing.description || "Sem descrição adicional"}
                              </p>
                              <div className="mt-2">
                                <span 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  Disponível
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteListing(listing.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg">
                    <CarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-1">
                      Você ainda não cadastrou vagas de garagem
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Se você possui vagas de garagem disponíveis, cadastre-as aqui para que outros moradores possam entrar em contato.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Cadastrar Vaga
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vagas-disponiveis">
            <Card>
              <CardHeader>
                <CardTitle>Vagas Disponíveis no Condomínio</CardTitle>
                <CardDescription>
                  Veja as vagas de garagem disponíveis e entre em contato com os proprietários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-6">Carregando...</div>
                ) : garageListings && garageListings.length > 0 ? (
                  <div className="space-y-4">
                    {garageListings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CarIcon className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                              <div>
                                <h3 className="font-medium">
                                  Vaga de Garagem - Unidade {listing.residents?.unidade}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {listing.description || "Sem descrição adicional"}
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0 sm:ml-4 bg-gray-50 p-3 rounded-md sm:self-start">
                                <h4 className="text-sm font-medium">Contato:</h4>
                                <p className="text-sm">{listing.residents?.nome_completo}</p>
                                {listing.residents?.telefone && (
                                  <p className="text-sm">Tel: {listing.residents.telefone}</p>
                                )}
                                {listing.residents?.email && (
                                  <p className="text-sm break-all">{listing.residents.email}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg">
                    <CarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600">
                      Não há vagas disponíveis no momento
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Quando outros moradores cadastrarem vagas disponíveis, elas aparecerão aqui.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Vaga de Garagem</DialogTitle>
              <DialogDescription>
                Informe os detalhes da vaga de garagem que você deseja disponibilizar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Descrição da Vaga
                </label>
                <Textarea
                  placeholder="Ex: Vaga coberta próxima ao bloco A, disponível para carro de pequeno porte."
                  className="w-full"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
                <p>
                  <strong>Nota:</strong> Seus dados de contato (nome, unidade, telefone e e-mail) serão 
                  exibidos para os moradores interessados.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddGarageListing}
                disabled={!description.trim() || addGarageListing.isPending}
              >
                {addGarageListing.isPending ? 'Cadastrando...' : 'Cadastrar Vaga'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GaragemLivre;
