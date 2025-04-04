
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useGarageListings } from '@/hooks/use-garage-listings';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Garagem Livre</h1>
              <p className="text-gray-600 mt-2">
                Sistema de compartilhamento de vagas de garagem.
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Cadastrar Vaga
            </Button>
          </div>
          <Separator className="mt-4" />
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-brand-600">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaga</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myGarageListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <CarIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <span>Unidade {user.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {listing.description || "Sem descrição adicional"}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Disponível
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg">
                  <CarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">
                    Você ainda não cadastrou vagas de garagem
                  </h3>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-brand-600">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Contato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {garageListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <CarIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <span>Unidade {listing.residents?.unidade}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {listing.description || "Sem descrição adicional"}
                        </TableCell>
                        <TableCell>
                          {listing.residents?.nome_completo}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {listing.residents?.telefone && (
                              <div className="text-sm">{listing.residents.telefone}</div>
                            )}
                            {listing.residents?.email && (
                              <div className="text-sm text-blue-600">{listing.residents.email}</div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
        </div>

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
