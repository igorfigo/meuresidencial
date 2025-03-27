
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDollarSign, CalendarClock, PieChart } from 'lucide-react';

interface ExpenseSummaryProps {
  totalAmount: number;
  categorySummary: Record<string, number>;
  statusSummary: Record<string, number>;
}

export function ExpenseSummary({ totalAmount, categorySummary, statusSummary }: ExpenseSummaryProps) {
  // Find top categories
  const topCategories = Object.entries(categorySummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Despesas</CardTitle>
          <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Principais Categorias</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="space-y-2">
              {topCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[120px]">{category}</span>
                  <span className="text-sm font-medium">
                    R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma categoria</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pendentes</span>
              <span className="text-sm font-medium">
                {statusSummary.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagas</span>
              <span className="text-sm font-medium">
                {statusSummary.paid || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Canceladas</span>
              <span className="text-sm font-medium">
                {statusSummary.cancelled || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
