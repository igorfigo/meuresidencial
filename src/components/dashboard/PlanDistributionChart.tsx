
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlanDistributionProps {
  data: {name: string, count: number, color: string}[];
  isLoading: boolean;
}

const PlanDistributionChart: React.FC<PlanDistributionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Sem dados disponíveis
      </div>
    );
  }

  // Calculate total for the label
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={70}
            paddingAngle={3}
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                strokeWidth={2}
                stroke="#ffffff"
                filter="url(#shadow)"
              />
            ))}
          </Pie>
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={(value, entry, index) => {
              return (
                <span className="capitalize text-xs">
                  {value}: <span className="font-medium">{data[index].count}</span>
                </span>
              );
            }} 
          />
          <Tooltip 
            formatter={(value) => [`${value} condomínios ativos`, '']}
            labelFormatter={(label) => `Plano ${label}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #f1f1f1'
            }}
          />
          {/* Add shadow filter for chart elements */}
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 text-center mt-1">
        Total: {total} condomínios ativos
      </div>
    </div>
  );
};

export default PlanDistributionChart;
