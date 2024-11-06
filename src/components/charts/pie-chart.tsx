import { PieChart as RechartsPieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export function PieChartComponent({ data, colors }: PieChartProps) {
  return (
    <ResponsiveContainer>
      <RechartsPieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          cornerRadius={4}
          stroke="var(--background)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell 
              key={index} 
              fill={colors[index]}
              opacity={0.9}
              name={`Series ${index + 1}`}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          formatter={(value, name) => [`${value}`, name]}
        />
        <Legend 
          verticalAlign="middle" 
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: '12px',
            paddingLeft: '24px',
            color: 'var(--foreground)'
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}