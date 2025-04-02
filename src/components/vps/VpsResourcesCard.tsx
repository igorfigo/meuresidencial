
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatToBRL } from '@/utils/currency';

interface ResourceData {
  name: string;
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
}

interface VpsResourcesCardProps {
  data: ResourceData[];
}

const VpsResourcesCard: React.FC<VpsResourcesCardProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            labelFormatter={(label) => `Servidor: ${label}`}
          />
          <Legend />
          <Bar dataKey="cpu" name="CPU" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="memory" name="Memória" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="storage" name="Armazenamento" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="bandwidth" name="Banda" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VpsResourcesCard;
