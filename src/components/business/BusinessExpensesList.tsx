
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, Calendar, Trash2, Eye, Paperclip } from 'lucide-react';
import { useBusinessExpenses, BusinessExpenseWithId } from '@/hooks/use-business-expenses';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const BusinessExpensesList = () => {
  const { 
    expenses, 
    isLoading, 
    removeExpense,
    getAttachments 
  } = useBusinessExpenses();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState<BusinessExpenseWithId | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);
  
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'salarios': 'Salários',
      'aluguel': 'Aluguel',
      'marketing': 'Marketing',
      'equipamentos': 'Equipamentos',
      'servicos': 'Serviços',
      'viagem': 'Viagem',
      'impostos': 'Impostos',
      'software': 'Software',
      'treinamento': 'Treinamento',
      'outros': 'Outros'
    };
    
    return categoryMap[category] || category;
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(date);
    } catch {
      return dateString;
    }
  };
  
  const handleDelete = async (expense: BusinessExpenseWithId) => {
    try {
      setDeletingIds(prev => new Set(prev).add(expense.id));
      
      await removeExpense(expense.id);
      
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(expense.id);
        return newSet;
      });
    }
  };
  
  const handleView = async (expense: BusinessExpenseWithId) => {
    setSelectedExpense(expense);
    
    try {
      const attachmentsData = await getAttachments(expense.id);
      
      for (const attachment of attachmentsData) {
        const { data } = supabase.storage
          .from('attachments')
          .getPublicUrl(attachment.file_path);
        
        attachment.publicUrl = data.publicUrl;
      }
      
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };
  
  const handleCloseDialog = () => {
    setSelectedExpense(null);
  };
  
  const handleShowAttachments = () => {
    setShowAttachments(true);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas Empresariais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Carregando despesas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas Empresariais</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma despesa empresarial registrada.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExpenses.map((expense) => (
                  <TableRow key={expense.id} className={deletingIds.has(expense.id) ? "opacity-40" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                        {getCategoryLabel(expense.category)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(expense.payment_date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {expense.amount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleView(expense)}
                          title="Visualizar Detalhes"
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(expense)}
                          title="Excluir Despesa"
                          disabled={deletingIds.has(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          isActive={currentPage === index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className="cursor-pointer"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
        
        {/* Detail Dialog */}
        <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Despesa</DialogTitle>
            </DialogHeader>
            
            {selectedExpense && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoria</p>
                    <p>{getCategoryLabel(selectedExpense.category)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor</p>
                    <p className="font-semibold">R$ {selectedExpense.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Pagamento</p>
                    <p>{formatDate(selectedExpense.payment_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p>{selectedExpense.description}</p>
                  </div>
                </div>
                
                {selectedExpense.observations && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Observações</p>
                    <p className="text-sm">{selectedExpense.observations}</p>
                  </div>
                )}
                
                {attachments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500">Anexos</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleShowAttachments}
                      >
                        <Paperclip className="h-3.5 w-3.5 mr-1" />
                        Ver anexos
                      </Button>
                    </div>
                    
                    {showAttachments && (
                      <div className="mt-2 space-y-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center text-sm">
                              <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="truncate max-w-[180px]">{attachment.file_name}</span>
                            </div>
                            <a
                              href={attachment.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 text-sm hover:underline"
                            >
                              Abrir
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
