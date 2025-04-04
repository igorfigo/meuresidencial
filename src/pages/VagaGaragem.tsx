
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
import { Car, AlertCircle, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function VagaGaragem() {
  const { user } = useApp();
  const { garageListings, isLoading } = useGarageListings();

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
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vagas de Garagem</h2>
          <p className="text-muted-foreground">
            Visualize as vagas de garagem disponíveis no condomínio.
          </p>
        </div>

        <Card className="border-t-4 border-t-brand-600">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              <span>Vagas de Garagem Disponíveis</span>
            </CardTitle>
            <CardDescription>
              Listagem de todas as vagas de garagem disponíveis no condomínio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : garageListings && garageListings.length > 0 ? (
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
                  {garageListings.map((listing) => (
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
    </DashboardLayout>
  );
}
