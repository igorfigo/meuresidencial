import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { BRLToNumber } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define a more specific Transaction type that includes required fields
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
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDeleteIncome?: (id: string) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
}

export const RecentTransactions = ({ 
  transactions, 
  onDeleteIncome, 
  onDeleteExpense 
}: RecentTransactionsProps) => {
  
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      // Income categories
      'taxa_condominio': 'Taxa de Condomínio',
      'reserva_area_comum': 'Reserva Área Comum',
      'taxa_extra': 'Taxa Extra',
      
      // Expense categories
      'energia': 'Energia',
      'agua': 'Água',
      'manutencao': 'Manutenção',
      'gas': 'Gás',
      'limpeza': 'Limpeza',
      'produtos': 'Produtos',
      'imposto': 'Imposto',
      'seguranca': 'Segurança',
      'sistema_condominio': 'Sistema Condomínio',
      
      'outros': 'Outros'
    };
    
    return categoryMap[category] || category;
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
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
      if (transaction.type === 'income' && onDeleteIncome) {
        await onDeleteIncome(transaction.id);
        toast.success('Receita excluída com sucesso');
      } else if (transaction.type === 'expense' && onDeleteExpense) {
        await onDeleteExpense(transaction.id);
        toast.success('Despesa excluída com sucesso');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    }
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
              <TableHead>Categoria</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow key={transaction.id || index}>
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
                  <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                  <TableCell>{formatMonth(transaction.reference_month)}</TableCell>
                  <TableCell>
                    {formatDate(transaction.payment_date || transaction.due_date)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(transaction)}
                      title="Excluir Transação"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
