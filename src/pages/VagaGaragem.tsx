
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useGarageListings } from '@/hooks/use-garage-listings';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Car, AlertCircle, Phone, Mail, Filter, Search, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { FinancialChartCard } from '@/components/financials/FinancialChartCard';
import { useState } from 'react';

export default function VagaGaragem() {
  const { user } = useApp();
  const { garageListings, isLoading } = useGarageListings();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter listings based on search term
  const filteredListings = garageListings?.filter(listing => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (listing.residents?.nome_completo || "").toLowerCase().includes(searchLower) ||
      (listing.residents?.unidade || "").toLowerCase().includes(searchLower) ||
      (listing.description || "").toLowerCase().includes(searchLower)
    );
  });

  if (!user || user.isResident || user.isAdmin) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Esta página é exclusiva para síndicos e administradores de condomínio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acesso Negado</AlertTitle>
              <AlertDescription>
                Você não tem permissão para acessar esta página.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>Vagas de Garagem</h2>
          <p className="text-muted-foreground text-sm">
            Visualize as vagas de garagem disponíveis no condomínio.
          </p>
        </div>

        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-4'}`}>
          {/* Search and filter card */}
          <div className={isMobile ? "" : "lg:col-span-3"}>
            <FinancialChartCard
              title="Pesquisar Vagas"
              icon={<Search className="h-4 w-4" />}
              tooltip="Pesquise por morador, unidade ou descrição"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Pesquisar vagas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {!isMobile && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>{filteredListings?.length || 0} {filteredListings?.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}</span>
                </div>
              )}
            </FinancialChartCard>
          </div>

          {/* Main content card */}
          <div className={isMobile ? "" : "lg:col-span-3"}>
            <Card className="border-t-4 border-t-brand-600">
              <CardHeader className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  <span>{isMobile ? "Vagas Disponíveis" : "Vagas de Garagem Disponíveis"}</span>
                </CardTitle>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  {isMobile && (
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Info className="h-3 w-3 mr-1" />
                      <span>{filteredListings?.length || 0} {filteredListings?.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-4'}`}>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : filteredListings && filteredListings.length > 0 ? (
                  isMobile ? (
                    // Mobile card view
                    <div className="space-y-3">
                      {filteredListings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden border-gray-200">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">
                                  {listing.residents?.nome_completo || "Nome não disponível"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Unidade: {listing.residents?.unidade || "N/A"}
                                </div>
                              </div>
                              <Badge 
                                variant={listing.is_available ? "default" : "secondary"}
                                className={listing.is_available ? "bg-green-500 hover:bg-green-600 text-xs" : "text-xs"}
                              >
                                {listing.is_available ? "Disponível" : "Indisponível"}
                              </Badge>
                            </div>
                            
                            {listing.description && (
                              <div className="mt-2 text-xs">
                                <span className="font-medium">Descrição:</span> {listing.description}
                              </div>
                            )}
                            
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <div className="flex flex-col space-y-1">
                                {listing.residents?.telefone && (
                                  <div className="flex items-center text-xs">
                                    <Phone className="mr-1 h-3 w-3 text-gray-500" />
                                    {listing.residents.telefone}
                                  </div>
                                )}
                                {listing.residents?.email && (
                                  <div className="flex items-center text-xs">
                                    <Mail className="mr-1 h-3 w-3 text-gray-500" />
                                    <span className="truncate">{listing.residents.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-500 text-right">
                              Cadastrado em {format(new Date(listing.created_at), 'dd/MM/yyyy')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    // Desktop table view
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Morador</TableHead>
                          <TableHead className="text-center">Unidade</TableHead>
                          <TableHead className="text-center">Descrição</TableHead>
                          <TableHead className="text-center">Contato</TableHead>
                          <TableHead className="text-center">Disponibilidade</TableHead>
                          <TableHead className="text-center">Data de Cadastro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredListings.map((listing) => (
                          <TableRow key={listing.id}>
                            <TableCell className="font-medium text-center">
                              {listing.residents?.nome_completo || "Nome não disponível"}
                            </TableCell>
                            <TableCell className="text-center">
                              {listing.residents?.unidade || "Unidade não disponível"}
                            </TableCell>
                            <TableCell className="text-center">
                              {listing.description || "Sem descrição"}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center space-y-1">
                                {listing.residents?.telefone && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="mr-2 h-3 w-3" />
                                    {listing.residents.telefone}
                                  </div>
                                )}
                                {listing.residents?.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="mr-2 h-3 w-3" />
                                    {listing.residents.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={listing.is_available ? "default" : "secondary"}
                                className={listing.is_available ? "bg-green-500 hover:bg-green-600" : ""}
                              >
                                {listing.is_available ? "Disponível" : "Indisponível"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {format(new Date(listing.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Car className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma vaga de garagem disponível</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Não há vagas de garagem cadastradas no condomínio no momento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
