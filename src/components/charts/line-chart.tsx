import { LineChart as RechartsLineChart, Line, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SharedXAxis, SharedYAxis } from './shared-axis';

interface Series {
  dataKey: string;
  name: string;
}

interface LineChartProps {
  data: Array<{ [key: string]: string | number }>;
  colors: string[];
  series: Series[];
}

export function LineChartComponent({ data, colors, series }: LineChartProps) {
  return (
    <ResponsiveContainer>
      <RechartsLineChart data={data} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
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
          cursor={{ strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Legend 
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            color: 'var(--foreground)'
          }}
        />
        {series.map((s, index) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={colors[index]}
            strokeWidth={2}
            dot={{ fill: colors[index], strokeWidth: 0, r: 4 }}
            activeDot={{ 
              fill: colors[index], 
              strokeWidth: 2, 
              stroke: 'var(--background)', 
              r: 6 
            }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}