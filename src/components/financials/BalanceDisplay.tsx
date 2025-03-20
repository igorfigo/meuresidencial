
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrencyInput } from '@/utils/currency';

interface BalanceDisplayProps {
  balance: string;
  onBalanceChange: (balance: string) => Promise<void>;
}

export const BalanceDisplay = ({ balance, onBalanceChange }: BalanceDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(balance);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local state when balance changes
  useEffect(() => {
    setEditBalance(balance);
  }, [balance]);
  
  const handleEdit = () => {
    setEditBalance(balance);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onBalanceChange(editBalance);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getBalanceClass = () => {
    const numBalance = parseFloat(balance.replace(',', '.'));
    if (numBalance > 0) return 'text-green-500';
    if (numBalance < 0) return 'text-red-500';
    return 'text-slate-500';
  };
  
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-t-2 border-t-brand-600 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Saldo Atual</h2>
          </div>
          
          {isEditing ? (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleCancel} className="h-7 text-xs px-2">
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="h-7 text-xs px-2">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-7 text-xs px-2">
              Editar
            </Button>
          )}
        </div>
        
        <div className="mt-2">
          {isEditing ? (
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
            <div className="flex items-baseline">
              <span className="text-sm font-bold mr-1 tracking-tight">R$</span>
              <span className={`text-lg font-bold ${getBalanceClass()}`}>
                {balance}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
