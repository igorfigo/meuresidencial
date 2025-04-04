
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlanDistributionProps {
  data: {name: string, count: number, color: string}[];
  isLoading: boolean;
}

const PlanDistributionChart: React.FC<PlanDistributionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        Sem dados disponíveis
      </div>
    );
  }

  // Calculate total for the label
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
            formatter={(value) => [`${value} condomínios`, '']}
            labelFormatter={(label) => `Plano ${label}`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 text-center mt-2">
        Total: {total} condomínios
      </div>
    </div>
  );
};

export default PlanDistributionChart;
