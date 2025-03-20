
import { useState } from 'react';
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
  
  // Atualiza o estado local quando o saldo é alterado
  useState(() => {
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
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-t-4 border-t-brand-600">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Saldo Atual</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? 'Edite o saldo manualmente' : 'Saldo atual do condomínio'}
            </p>
          </div>
          
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              Editar Saldo
            </Button>
          )}
        </div>
        
        <div className="mt-6">
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="balance">Saldo</Label>
              <Input
                id="balance"
                isCurrency
                onChange={(e) => {
                  const formattedValue = formatCurrencyInput(e.target.value.replace(/\D/g, ''));
                  setEditBalance(formattedValue);
                }}
                value={`R$ ${editBalance}`}
                className="text-2xl font-bold h-16"
              />
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className="text-4xl font-bold mr-2 tracking-tight">R$</span>
              <span className={`text-5xl font-extrabold ${getBalanceClass()}`}>
                {balance}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
