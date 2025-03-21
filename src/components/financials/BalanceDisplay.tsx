
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { formatCurrencyInput } from '@/utils/currency';
import { FinancialBalance } from '@/hooks/use-finances';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceDisplayProps {
  balance: FinancialBalance | null;
  isLoading?: boolean;
  onBalanceChange?: (balance: string) => Promise<void>;
}

export const BalanceDisplay = ({ balance, isLoading, onBalanceChange }: BalanceDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(balance?.balance || '0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local state when balance changes
  useEffect(() => {
    setEditBalance(balance?.balance || '0');
  }, [balance]);
  
  const handleEdit = () => {
    setEditBalance(balance?.balance || '0');
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (!onBalanceChange) return;
    
    setIsSubmitting(true);
    try {
      await onBalanceChange(editBalance);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getBalanceClass = () => {
    const numBalance = parseFloat((balance?.balance || '0').replace(',', '.'));
    if (numBalance > 0) return 'text-green-500';
    if (numBalance < 0) return 'text-red-500';
    return 'text-slate-500';
  };
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50 border-t-4 border-t-brand-600 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-10 w-24 mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-t-4 border-t-brand-600 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-3">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 mb-2 w-full">
            <h2 className="text-base font-semibold text-gray-800">Saldo Atual</h2>
            {!isEditing && onBalanceChange && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleEdit} 
                className="h-6 w-6 p-0"
              >
                <Pencil size={14} />
              </Button>
            )}
          </div>
          
          {isEditing && onBalanceChange && (
            <div className="flex gap-1 mt-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="h-7 text-xs px-2">
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="h-7 text-xs px-2">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-2">
          {isEditing && onBalanceChange ? (
            <div className="space-y-1">
              <Label htmlFor="balance" className="text-xs">Saldo</Label>
              <Input
                id="balance"
                isCurrency
                onChange={(e) => {
                  const formattedValue = formatCurrencyInput(e.target.value.replace(/\D/g, ''));
                  setEditBalance(formattedValue);
                }}
                value={`R$ ${editBalance}`}
                className="text-sm font-bold h-8"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="flex items-baseline bg-white/70 px-3 py-1 rounded-md">
                <span className="text-sm font-bold mr-1 tracking-tight">R$</span>
                <span className={`text-xl font-bold ${getBalanceClass()}`}>
                  {balance?.balance || '0'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
