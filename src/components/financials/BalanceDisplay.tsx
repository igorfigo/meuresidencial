
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Wallet, LockIcon, Search, AlertTriangle } from 'lucide-react';
import { formatCurrencyInput, BRLToNumber } from '@/utils/currency';
import { BalanceHistoryDialog } from './BalanceHistoryDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BalanceDisplayProps {
  balance: string;
  onBalanceChange?: (balance: string) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  matricula?: string;
}

export const BalanceDisplay = ({ balance, onBalanceChange, readOnly = false, className, matricula }: BalanceDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(balance);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  // Update local state when balance changes
  useEffect(() => {
    setEditBalance(balance);
  }, [balance]);
  
  const handleEdit = () => {
    setEditBalance(balance);
    setIsEditing(true);
    setShowAlert(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setShowAlert(false);
  };
  
  const handleSave = async () => {
    if (!onBalanceChange) return;
    
    setIsSubmitting(true);
    try {
      // By awaiting this operation, we ensure the promise resolves before setting isEditing to false
      await onBalanceChange(editBalance);
      setIsEditing(false);
      setShowAlert(false);
    } catch (error) {
      console.error('Error saving balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
  };
  
  const getBalanceClass = () => {
    const numBalance = BRLToNumber(balance);
    if (numBalance > 0) return 'text-green-600';
    if (numBalance < 0) return 'text-red-600';
    return 'text-slate-500';
  };
  
  return (
    <>
      <Card className={`bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 ${className || ''}`}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3 w-full">
              <Wallet className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Saldo Atual</h3>
              <div className="ml-auto flex items-center gap-1">
                {!readOnly && matricula && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleOpenHistory} 
                    className="h-6 w-6 p-0"
                    title="Ver histórico de alterações"
                  >
                    <Search size={14} />
                  </Button>
                )}
                {!readOnly && !isEditing && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleEdit} 
                    className="h-6 w-6 p-0"
                  >
                    <Pencil size={14} />
                  </Button>
                )}
                {readOnly && (
                  <LockIcon className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            {showAlert && (
              <Alert variant="destructive" className="mb-3 py-2 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Atenção: Após modificar o saldo, datas de recebimento de receitas e de pagamento de despesas não poderão ser anteriores a esta data.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="w-full">
              {!readOnly && isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="balance" className="text-xs">Saldo</Label>
                  <Input
                    id="balance"
                    value={`R$ ${editBalance}`}
                    onChange={(e) => {
                      const formattedValue = formatCurrencyInput(e.target.value.replace(/\D/g, ''));
                      setEditBalance(formattedValue);
                    }}
                    className="text-sm font-bold h-8"
                  />
                  
                  <div className="flex gap-1 mt-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleCancel} className="h-7 text-xs px-2">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="h-7 text-xs px-2">
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="flex items-baseline bg-white/70 px-3 py-2 rounded-md">
                    <span className="text-sm font-bold mr-1 tracking-tight">R$</span>
                    <span className={`text-2xl font-bold ${getBalanceClass()}`}>
                      {balance}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {matricula && (
        <BalanceHistoryDialog 
          isOpen={isHistoryOpen} 
          setIsOpen={setIsHistoryOpen}
          matricula={matricula}
        />
      )}
    </>
  );
};
