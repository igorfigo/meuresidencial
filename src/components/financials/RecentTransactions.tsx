
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowDownCircle, ArrowUpCircle, Trash2, Eye } from 'lucide-react';
import { BRLToNumber } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: string;
  reference_month: string;
  payment_date?: string;
  due_date?: string;
  date: string;
  unit?: string;
  observations?: string;
  created_at?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDeleteIncome?: (id: string) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
}

export const RecentTransactions = ({ 
  transactions: initialTransactions, 
  onDeleteIncome, 
  onDeleteExpense 
}: RecentTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;
  
  if (JSON.stringify(transactions) !== JSON.stringify(initialTransactions)) {
    setTransactions(initialTransactions);
  }
  
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'taxa_condominio': 'Taxa de Condomínio',
      'reserva_area_comum': 'Reserva Área Comum',
      'taxa_extra': 'Taxa Extra',
      'multa': 'Multa',
      'outros_receita': 'Outros (Receita)',
      'energia': 'Energia',
      'agua': 'Água',
      'manutencao': 'Manutenção',
      'gas': 'Gás',
      'limpeza': 'Limpeza',
      'produtos': 'Produtos',
      'imposto': 'Imposto',
      'seguranca': 'Segurança',
      'sistema_condominio': 'Sistema Condomínio',
      'outros_despesa': 'Outros (Despesa)'
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
  
  const formatAmount = (amount: string, type: 'income' | 'expense'): string => {
    const numAmount = BRLToNumber(amount);
    return numAmount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatMonth = (monthString: string): string => {
    try {
      const [year, month] = monthString.split('-');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      return `${monthNames[parseInt(month, 10) - 1]}/${year}`;
    } catch {
      return monthString;
    }
  };
  
  const handleDelete = async (transaction: Transaction) => {
    if (!transaction.id) {
      toast.error('Não foi possível excluir esta transação');
      return;
    }
    
    try {
      setDeletingIds(prev => new Set(prev).add(transaction.id!));
      
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      
      if (transaction.type === 'income' && onDeleteIncome) {
        await onDeleteIncome(transaction.id);
      } else if (transaction.type === 'expense' && onDeleteExpense) {
        await onDeleteExpense(transaction.id);
      }
      
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      
      setTransactions(initialTransactions);
      toast.error('Erro ao excluir transação');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id!);
        return newSet;
      });
    }
  };
  
  const handleView = (transaction: Transaction) => {
    const typeLabel = transaction.type === 'income' ? 'Receita' : 'Despesa';
    const amountFormatted = formatAmount(transaction.amount, transaction.type);
    
    toast(
      <div className="space-y-2">
        <h3 className="font-medium">{typeLabel}: {getCategoryLabel(transaction.category)}</h3>
        <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="font-medium">Valor:</span>
          <span>{amountFormatted}</span>
          
          <span className="font-medium">Referência:</span>
          <span>{formatMonth(transaction.reference_month)}</span>
          
          <span className="font-medium">Data:</span>
          <span>{formatDate(transaction.payment_date || transaction.due_date)}</span>
          
          {transaction.unit && (
            <>
              <span className="font-medium">Unidade:</span>
              <span>{transaction.unit}</span>
            </>
          )}
          
          {transaction.observations && (
            <>
              <span className="font-medium">Observações:</span>
              <span>{transaction.observations}</span>
            </>
          )}
        </div>
      </div>,
      {
        description: "Detalhes da transação",
        duration: 5000
      }
    );
  };
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <Card className="border-t-4 border-t-brand-600">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Unidade</TableHead>
              <TableHead className="text-center">Referência</TableHead>
              <TableHead className="text-center">Data de Pgto</TableHead>
              <TableHead className="text-center">Valor</TableHead>
              <TableHead className="text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction, index) => (
                <TableRow key={transaction.id || index} className={deletingIds.has(transaction.id || '') ? "opacity-40" : ""}>
                  <TableCell>
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      <span>{transaction.type === 'income' ? 'Receita' : 'Despesa'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getCategoryLabel(transaction.category)}</TableCell>
                  <TableCell className="text-center">{transaction.unit || '-'}</TableCell>
                  <TableCell className="text-center">{formatMonth(transaction.reference_month)}</TableCell>
                  <TableCell className="text-center">
                    {formatDate(transaction.payment_date || transaction.due_date)}
                  </TableCell>
                  <TableCell className={`text-center font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleView(transaction)}
                        title="Visualizar Detalhes"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(transaction)}
                        title="Excluir Transação"
                        disabled={deletingIds.has(transaction.id || '')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
