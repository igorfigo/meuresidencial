
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowDownCircle, ArrowUpCircle, Trash2, Eye, Filter, Calendar } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusLegend } from './PaymentStatusLegend';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 5 : 6;
  
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
  
  // Get unique months for the month filter
  const getUniqueMonths = () => {
    const uniqueMonthsMap = new Map();
    
    initialTransactions.forEach(transaction => {
      uniqueMonthsMap.set(transaction.reference_month, formatMonth(transaction.reference_month));
    });
    
    return Array.from(uniqueMonthsMap.entries()).map(([value, label]) => ({
      value,
      label
    })).sort((a, b) => {
      // Sort descending (newest first)
      return b.value.localeCompare(a.value);
    });
  };
  
  const uniqueMonths = getUniqueMonths();
  
  const filteredTransactions = initialTransactions.filter(transaction => {
    let matches = true;
    
    if (transactionTypeFilter !== 'all') {
      matches = matches && (transaction.type === transactionTypeFilter);
    }
    
    if (monthFilter !== 'all') {
      matches = matches && (transaction.reference_month === monthFilter);
    }
    
    return matches;
  });
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const renderMobileCard = (transaction: Transaction, index: number) => {
    return (
      <div 
        key={transaction.id || index} 
        className={`border rounded-md p-3 mb-2 ${deletingIds.has(transaction.id || '') ? "opacity-40" : ""}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {transaction.type === 'income' ? (
              <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
            )}
            <span className="font-medium">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</span>
          </div>
          <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(transaction.amount, transaction.type)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>
            <p className="text-xs text-gray-500">Categoria</p>
            <p className="truncate">{getCategoryLabel(transaction.category)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Referência</p>
            <p>{formatMonth(transaction.reference_month)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Data</p>
            <p>{formatDate(transaction.payment_date || transaction.due_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Unidade</p>
            <p>{transaction.unit || '-'}</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-1 border-t pt-2 mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleView(transaction)}
            title="Visualizar Detalhes"
            className="h-8"
          >
            <Eye className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-xs">Detalhes</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(transaction)}
            title="Excluir Transação"
            disabled={deletingIds.has(transaction.id || '')}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs">Excluir</span>
          </Button>
        </div>
      </div>
    );
  };
  
  const renderDesktopTable = () => (
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
  );
  
  return (
    <Card className="border-t-4 border-t-brand-600">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <CardTitle>Transações Recentes</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={transactionTypeFilter}
                onValueChange={(value) => {
                  setTransactionTypeFilter(value as 'all' | 'income' | 'expense');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      <span>Receitas</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      <span>Despesas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select
                value={monthFilter}
                onValueChange={(value) => {
                  setMonthFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Mês de referência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {uniqueMonths.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {transactionTypeFilter !== 'all' && (
            <Badge variant={transactionTypeFilter === 'income' ? 'outline' : 'destructive'} className="text-xs">
              {transactionTypeFilter === 'income' ? 'Receitas' : 'Despesas'}
            </Badge>
          )}
          
          {monthFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {uniqueMonths.find(m => m.value === monthFilter)?.label || monthFilter}
            </Badge>
          )}
        </div>
        
        <PaymentStatusLegend compact className="mt-2 mb-0" />
      </CardHeader>
      
      <CardContent>
        {isMobile ? (
          <>
            {currentTransactions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                Nenhuma transação encontrada
              </div>
            ) : (
              <div className="space-y-2">
                {currentTransactions.map((transaction, index) => renderMobileCard(transaction, index))}
              </div>
            )}
          </>
        ) : (
          renderDesktopTable()
        )}
        
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent className={isMobile ? "gap-1" : ""}>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isMobile ? "h-8 w-8 p-0 flex items-center justify-center" : ""}`}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {/* On mobile, show fewer page numbers */}
                {Array.from({ length: totalPages })
                  .map((_, index) => {
                    const pageNum = index + 1;
                    
                    // On mobile, only show current page, first, last, and 1 before/after current
                    if (isMobile) {
                      const showFirstPage = pageNum === 1;
                      const showLastPage = pageNum === totalPages;
                      const showCurrentPage = pageNum === currentPage;
                      const showNearCurrent = 
                        (pageNum === currentPage - 1) || 
                        (pageNum === currentPage + 1);
                      
                      if (!showFirstPage && !showLastPage && !showCurrentPage && !showNearCurrent) {
                        return null;
                      }
                      
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <PaginationItem key={index}>
                            <span className="px-1">...</span>
                          </PaginationItem>
                        );
                      }
                    }
                    
                    return (
                      <PaginationItem key={index}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`cursor-pointer ${isMobile ? "h-8 w-8 p-0 flex items-center justify-center" : ""}`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }).filter(Boolean)}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isMobile ? "h-8 w-8 p-0 flex items-center justify-center" : ""}`}
                    aria-disabled={currentPage === totalPages}
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

