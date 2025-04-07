
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarIcon, PlusCircleIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import { useGarageListings } from '@/hooks/use-garage-listings';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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

  const GarageListingCard = ({ listing, isMyListing = false }) => (
    <Card key={listing.id} className={`mb-3 w-full ${isMyListing ? 'border-l-4 border-l-brand-600' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <CarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium">
              {isMyListing ? `Unidade ${user.unit}` : `Unidade ${listing.residents?.unidade}`}
            </span>
          </div>
          {isMyListing && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteListing(listing.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
          {listing.description || "Sem descrição adicional"}
        </div>
        
        {isMyListing && (
          <div className="mt-3 flex items-center">
            <Badge className="bg-green-500 hover:bg-green-600">
              Disponível
            </Badge>
          </div>
        )}
        
        {!isMyListing && (
          <div className="mt-3 pt-3 border-t">
            <p className="font-medium text-sm mb-2">Informações de contato:</p>
            <div className="space-y-1.5 bg-blue-50 p-3 rounded-md">
              <div className="font-medium text-blue-900">{listing.residents?.nome_completo}</div>
              {listing.residents?.telefone && (
                <div className="flex items-center text-sm text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {listing.residents.telefone}
                </div>
              )}
              {listing.residents?.email && (
                <div className="flex items-center text-sm text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{listing.residents.email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-4">
        <div className="mb-4">
          {isMobile ? (
            <div className="flex flex-col">
              <div className="flex items-center mb-3">
                <CarIcon className="h-5 w-5 text-brand-600 mr-2" />
                <h1 className="text-xl sm:text-2xl font-bold">Garagem Livre</h1>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full mb-2">
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Disponibilizar Vaga
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <CarIcon className="h-5 w-5 text-brand-600 mr-2" />
                  <h1 className="text-xl sm:text-2xl font-bold">Garagem Livre</h1>
                </div>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="whitespace-nowrap">
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Disponibilizar Vaga
              </Button>
            </div>
          )}
          <Separator className="mt-4" />
        </div>

        <div className="space-y-4">
          <Card className="border-t-4 border-t-brand-600 w-full">
            <CardHeader className={isMobile ? "p-3" : undefined}>
              <CardTitle className={isMobile ? "text-lg" : undefined}>Minhas Vagas</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : undefined}>
                Gerencie as vagas que você disponibilizou.
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : undefined}>
              {isLoading ? (
                <div className="animate-pulse space-y-2 w-full">
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              ) : myGarageListings && myGarageListings.length > 0 ? (
                isMobile ? (
                  <div className="w-full">
                    {myGarageListings.map((listing) => (
                      <GarageListingCard key={listing.id} listing={listing} isMyListing={true} />
                    ))}
                  </div>
                ) : (
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
                )
              ) : (
                <div className="text-center py-6 bg-gray-50 border border-dashed rounded-lg w-full">
                  <CarIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-600 mb-1`}>
                    Você ainda não cadastrou vagas
                  </h3>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 max-w-xs mx-auto`}>
                    Cadastre suas vagas disponíveis para que outros moradores possam utilizar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-brand-600 w-full">
            <CardHeader className={isMobile ? "p-3" : undefined}>
              <CardTitle className={isMobile ? "text-lg" : undefined}>Vagas Disponíveis</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : undefined}>
                Veja as vagas disponíveis no condomínio.
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : undefined}>
              {isLoading ? (
                <div className="animate-pulse space-y-2 w-full">
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              ) : garageListings && garageListings.length > 0 ? (
                isMobile ? (
                  <div className="w-full">
                    {garageListings.map((listing) => (
                      <GarageListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
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
                )
              ) : (
                <div className="text-center py-6 bg-gray-50 border border-dashed rounded-lg w-full">
                  <CarIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-600`}>
                    Nenhuma vaga disponível
                  </h3>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 max-w-xs mx-auto`}>
                    Quando outros moradores cadastrarem vagas, elas aparecerão aqui.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={isMobile ? "max-w-[95vw] p-4" : undefined}>
            <DialogHeader>
              <DialogTitle>Disponibilizar Vaga de Garagem</DialogTitle>
              <DialogDescription>
                Informe os detalhes da vaga que deseja disponibilizar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="mb-3">
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
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 flex gap-2">
                <InfoIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <p>
                  Seus dados de contato (nome, unidade, telefone e e-mail) serão 
                  exibidos para os moradores interessados.
                </p>
              </div>
            </div>
            <DialogFooter className={isMobile ? "flex-col space-y-2 mt-2" : undefined}>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className={isMobile ? "w-full" : undefined}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddGarageListing}
                disabled={!description.trim() || addGarageListing.isPending}
                className={isMobile ? "w-full" : undefined}
              >
                {addGarageListing.isPending ? 'Cadastrando...' : 'Disponibilizar Vaga'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GaragemLivre;
