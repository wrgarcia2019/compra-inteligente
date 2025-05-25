
import React from 'react'; // Removed useState, useEffect
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceGraphProps {
  data: Array<{ name: string; value: number; fill?: string }>;
  title: string;
  isOverBudget?: boolean;
}

const PriceGraph = ({ data, title, isOverBudget = false }: PriceGraphProps) => {
  // Using actual hex colors for Recharts
  const defaultColors = ['#0ea5e9', '#f87171', '#f97316', '#84cc16', '#10b981', '#06b6d4']; // Sky, Red, Orange, Lime, Emerald, Cyan

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-lg h-72 md:h-96">
      <h3 className={"text-lg font-semibold text-slate-200 mb-4 text-center" + (isOverBudget ? ' blinking-warning-text' : '')}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#cbd5e1' }}
            formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            fill="#8884d8" // Default fill, overridden by Cell
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={"cell-" + index} fill={entry.fill || defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceGraph;