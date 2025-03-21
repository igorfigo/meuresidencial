
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Wallet, LockIcon } from 'lucide-react';
import { formatCurrencyInput } from '@/utils/currency';

interface BalanceDisplayProps {
  balance: string;
  onBalanceChange?: (balance: string) => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

export const BalanceDisplay = ({ balance, onBalanceChange, readOnly = false, className }: BalanceDisplayProps) => {
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
    const numBalance = parseFloat(balance.replace(',', '.'));
    if (numBalance > 0) return 'text-green-500';
    if (numBalance < 0) return 'text-red-500';
    return 'text-slate-500';
  };
  
  return (
    <Card className={`bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-sm ${className || ''}`}>
      <CardContent className="p-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 mb-1.5">
            <Wallet className="h-3.5 w-3.5 text-blue-500" />
            <h3 className="font-medium text-xs text-gray-700">Saldo Atual</h3>
            {!readOnly && !isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleEdit} 
                className="h-4 w-4 p-0 ml-auto"
              >
                <Pencil size={10} />
              </Button>
            )}
            {readOnly && (
              <LockIcon className="h-3 w-3 text-gray-400 ml-auto" />
            )}
          </div>
          
          <div className="w-full">
            {!readOnly && isEditing ? (
              <div className="space-y-1">
                <Label htmlFor="balance" className="text-xs">Saldo</Label>
                <Input
                  id="balance"
                  value={`R$ ${editBalance}`}
                  onChange={(e) => {
                    const formattedValue = formatCurrencyInput(e.target.value.replace(/\D/g, ''));
                    setEditBalance(formattedValue);
                  }}
                  className="text-xs font-medium h-6"
                />
                
                <div className="flex gap-1 mt-1 justify-end">
                  <Button variant="outline" size="sm" onClick={handleCancel} className="h-5 text-xs px-1.5">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="h-5 text-xs px-1.5">
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-baseline bg-white/70 px-2 py-1 rounded">
                  <span className="text-xs font-medium mr-0.5 tracking-tight">R$</span>
                  <span className={`text-base font-bold ${getBalanceClass()}`}>
                    {balance}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
