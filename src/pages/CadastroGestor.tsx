import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building, Save, Search, History } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCondominiumForm } from '@/hooks/use-condominium-form';
import { CondominiumForm } from '@/components/condominium/CondominiumForm';
import { SearchMatricula } from '@/components/condominium/SearchMatricula';

const CadastroGestor = () => {
  const {
    form,
    isSubmitting,
    isSearching,
    matriculaSearch,
    setMatriculaSearch,
    isExistingRecord,
    changeLogs,
    isLoadingLogs,
    currentPage,
    totalPages,
    handleInputChange,
    handleMatriculaSearch,
    onSubmit,
    getCurrentItems,
    handlePageChange,
    getPageNumbers,
    toggleAtivoStatus
  } = useCondominiumForm();

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numericValue = e.target.value.replace(/\D/g, '');
    setMatriculaSearch(numericValue);
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
          <Separator className="mt-4" />
        </header>

        <SearchMatricula 
          matriculaSearch={matriculaSearch}
          onMatriculaChange={setMatriculaSearch}
          onSearch={handleMatriculaSearch}
          isSearching={isSearching}
        />

        <CondominiumForm 
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isExistingRecord={isExistingRecord}
          handleInputChange={handleInputChange}
          toggleAtivoStatus={toggleAtivoStatus}
        />
        
        {getCurrentItems().length > 0 && (
          <Card className="mt-8 mb-8 p-6 border-t-4 border-t-brand-600 shadow-md">
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
