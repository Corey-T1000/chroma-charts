import { BarChart as RechartsBarChart, Bar, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { SharedXAxis, SharedYAxis } from './shared-axis';

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export function BarChartComponent({ data, colors }: BarChartProps) {
  const normalizedData = data.map(item => ({
    ...item,
    value: Math.max(0, item.value)
  }));

  return (
    <ResponsiveContainer>
      <RechartsBarChart data={normalizedData} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          horizontal={true}
          vertical={false}
          stroke="currentColor" 
          opacity={0.1} 
        />
        <SharedXAxis />
        <SharedYAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          cursor={{ fill: 'currentColor', opacity: 0.1 }}
        />
        <Legend 
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => `Series ${value}`}
          wrapperStyle={{
            fontSize: '12px',
            color: 'var(--foreground)'
          }}
        />
        <Bar 
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          {normalizedData.map((_, index) => (
            <Cell 
              key={index} 
              fill={colors[index]} 
              name={`${index + 1}`}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}