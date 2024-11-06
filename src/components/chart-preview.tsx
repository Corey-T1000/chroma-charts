import { useState } from 'react';
import { ColorConfig } from '@/lib/types';
import { LineChartComponent } from './charts/line-chart';
import { BarChartComponent } from './charts/bar-chart';
import { PieChartComponent } from './charts/pie-chart';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

function generateData(colorCount: number): ChartData[] {
  // Generate 8 data points for the X axis
  const dataPoints = Array.from({ length: 8 }, (_, i) => ({
    name: `Point ${i + 1}`,
  }));

  // For each color/series, generate unique values
  for (let i = 0; i < colorCount; i++) {
    const seriesName = `series${i + 1}`;
    const baseValue = Math.random() * 400 + 200; // Random base between 200-600
    const variance = Math.random() * 200 + 100; // Random variance between 100-300

    dataPoints.forEach((point, index) => {
      // Generate a smooth curve with some randomness
      const angle = (index / (dataPoints.length - 1)) * Math.PI * 2;
      const wave = Math.sin(angle + (i * Math.PI / colorCount));
      const value = baseValue + wave * variance + (Math.random() - 0.5) * 50;
      point[seriesName] = Math.round(value);
    });
  }

  return dataPoints;
}

interface ChartPreviewProps {
  colors: ColorConfig;
}

export function ChartPreview({ colors }: ChartPreviewProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const activeColors = colors[mode].filter(color => 
    color !== '#000000' && color !== '#ffffff'
  );
  
  // Generate data with multiple series
  const data = generateData(activeColors.length || 1);

  // Create series configuration for the line chart
  const series = activeColors.map((_, index) => ({
    dataKey: `series${index + 1}`,
    name: `Series ${index + 1}`
  }));

  // Transform data for bar and pie charts
  const barData = activeColors.map((_, index) => ({
    name: `Series ${index + 1}`,
    value: data[Math.floor(data.length / 2)][`series${index + 1}`] as number
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Preview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="gap-2"
        >
          {mode === 'light' ? (
            <>
              <Sun className="h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark
            </>
          )}
        </Button>
      </div>

      <div className={`space-y-6 rounded-lg ${mode === 'dark' ? 'dark bg-background text-foreground' : ''}`}>
        <div className="p-4 border rounded-lg">
          <h3 className="text-base font-medium mb-4">Line Chart</h3>
          <div className="h-[200px] w-full">
            <LineChartComponent 
              data={data} 
              colors={activeColors}
              series={series}
            />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-base font-medium mb-4">Bar Chart</h3>
          <div className="h-[200px] w-full">
            <BarChartComponent 
              data={barData} 
              colors={activeColors} 
            />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-base font-medium mb-4">Pie Chart</h3>
          <div className="h-[200px] w-full">
            <PieChartComponent 
              data={barData} 
              colors={activeColors} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}