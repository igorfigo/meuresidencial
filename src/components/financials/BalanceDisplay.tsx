
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface BalanceDisplayProps {
  balance: string;
}

export const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
  const getBalanceClass = () => {
    const numBalance = parseFloat(balance.replace(',', '.'));
    if (numBalance > 0) return 'text-green-500';
    if (numBalance < 0) return 'text-red-500';
    return 'text-slate-500';
  };
  
  return (
    <Card className="overflow-hidden border-blue-300 shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-3 w-full">
            <Wallet className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Saldo Atual</h3>
          </div>
          
          <div className="w-full">
            <div className="flex items-center justify-center">
              <div className="flex items-baseline bg-white/70 px-3 py-2 rounded-md">
                <span className="text-sm font-bold mr-1 tracking-tight">R$</span>
                <span className={`text-2xl font-bold ${getBalanceClass()}`}>
                  {balance}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
