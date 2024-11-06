import { XAxis, YAxis } from 'recharts';

interface AxisProps {
  dataKey?: string;
}

export function SharedXAxis({ dataKey = 'name' }: AxisProps) {
  return (
    <XAxis
      dataKey={dataKey}
      axisLine={false}
      tickLine={false}
      tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }}
      dy={10}
      padding={{ left: 16, right: 16 }}
    />
  );
}

export function SharedYAxis({ dataKey = 'value' }: AxisProps) {
  return (
    <YAxis
      dataKey={dataKey}
      axisLine={false}
      tickLine={false}
      tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }}
      dx={-10}
      padding={{ top: 16, bottom: 16 }}
    />
  );
}