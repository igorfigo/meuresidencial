
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  // Replace Parking with alternatives from Lucide
  Car, Phone, Mail, Home 
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Define the interface for GaragemLivre type
interface GaragemLivre {
  id: string;
  matricula: string;
  unidade: string;
  nome_completo: string;
  telefone: string | null;
  email: string | null;
  descricao: string;
  valor: string;
  observacoes?: string;
  created_at: string;
  resident_id: string;
}

const GaragensDisponiveisCondominio = () => {
  const { user } = useApp();
  const matricula = user?.matricula;

  // Fetch all available garages from the condominium (except the user's own)
  const { data: garagens = [], isLoading } = useQuery({
    queryKey: ['garagens-disponiveis', matricula],
    queryFn: async () => {
      if (!matricula) return [];
      
      // Use casting to work around the type error
      const { data, error } = await (supabase
        .from('garagens_livre')
        .select('*')
        .eq('matricula', matricula) // Filter for the same condominium
        .neq('resident_id', user?.residentId) // Exclude user's own listings
        .order('created_at', { ascending: false }) as any);
        
      if (error) {
        console.error('Error fetching garagens disponíveis:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!matricula
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Garagens Disponíveis no Condomínio</h1>
        <Separator className="mb-2" />
        <p className="text-muted-foreground mb-6">
          Veja todas as vagas de garagem disponíveis para aluguel no seu condomínio.
        </p>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Carregando garagens disponíveis...</p>
          </div>
        ) : (garagens as GaragemLivre[]).length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma garagem disponível</h3>
                <p className="text-muted-foreground">
                  No momento não há vagas de garagem disponíveis para aluguel no seu condomínio.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(garagens as GaragemLivre[]).map((garagem) => (
              <Card key={garagem.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-2"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Car className="h-5 w-5 mr-2 text-purple-600" />
                    {garagem.descricao}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      R$ {garagem.valor}/mês
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {garagem.observacoes && (
                      <p className="text-sm text-gray-600 mb-4">{garagem.observacoes}</p>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2 text-sm text-gray-700">Informações de Contato:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Home className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-1">Unidade:</span> 
                          {garagem.unidade}
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-1">Proprietário:</span> 
                          {garagem.nome_completo}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-1">Telefone:</span> 
                          {garagem.telefone || 'Não informado'}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-1">Email:</span> 
                          {garagem.email || 'Não informado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GaragensDisponiveisCondominio;
