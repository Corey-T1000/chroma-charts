import { useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ColorConfig, NamedColor } from '@/lib/types';
import { Plus, Wand2, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

interface ColorPaletteProps {
  colors: ColorConfig;
  availableColors: NamedColor[];
  onColorChange: (mode: 'light' | 'dark', index: number, color: string) => void;
  onAddColor: () => void;
  onAutoGenerate: () => void;
  onRemoveColor: (index: number) => void;
  autoGenCounter: number;
  maxColors?: number;
}

export function ColorPalette({ 
  colors, 
  availableColors, 
  onColorChange, 
  onAddColor,
  onAutoGenerate,
  onRemoveColor,
  autoGenCounter,
  maxColors
}: ColorPaletteProps) {
  const { toast } = useToast();
  
  const uniqueColors = useMemo(() => {
    const colorMap = new Map();
    
    if (availableColors.length > 0) {
      availableColors.forEach(c => {
        if (c.value !== '#000000' && c.value !== '#ffffff') {
          colorMap.set(`${c.name}-${c.value}`, { ...c });
        }
      });
    } else {
      [...colors.light, ...colors.dark].forEach((color, index) => {
        if (color !== '#000000' && color !== '#ffffff') {
          colorMap.set(`color-${index}-${color}`, { name: color, value: color });
        }
      });
    }
    
    return Array.from(colorMap.values());
  }, [colors, availableColors]);

  const handleAutoGenerate = useCallback(() => {
    onAutoGenerate();
  }, [onAutoGenerate]);

  const canAddMore = !maxColors || colors.light.length < maxColors;

  return (
    <div className="space-y-8">
      {(['light', 'dark'] as const).map((mode) => (
        <div key={mode} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold capitalize">{mode} Mode</h2>
            <div className="flex gap-2">
              <Button 
                onClick={handleAutoGenerate} 
                variant="outline" 
                size="sm"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Auto-Generate
              </Button>
              {canAddMore && (
                <Button onClick={onAddColor} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Color
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {colors[mode].map((color, index) => {
              const namedColor = availableColors.find(c => c.value === color);
              return (
                <div key={`${mode}-${index}`} className="space-y-2">
                  <Label>Color {index + 1}</Label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 relative"
                        >
                          <div
                            className="absolute inset-2 rounded"
                            style={{ backgroundColor: color }}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[320px] p-0" 
                        align="start"
                        side="right"
                      >
                        <ScrollArea className="h-[320px]">
                          <div className="grid grid-cols-4 gap-1 p-1">
                            {uniqueColors.map((colorOption) => (
                              <Button
                                key={`${colorOption.name}-${colorOption.value}`}
                                variant="ghost"
                                className="h-14 p-1 relative group"
                                onClick={() => onColorChange(mode, index, colorOption.value)}
                              >
                                <div
                                  className="absolute inset-2 rounded transition-all group-hover:inset-1"
                                  style={{ backgroundColor: colorOption.value }}
                                />
                                <span className="absolute inset-x-0 bottom-0 bg-background/90 text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate px-2">
                                  {colorOption.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    {colors[mode].length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-muted hover:bg-muted-foreground/20"
                        onClick={() => onRemoveColor(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    <div className="mt-1 text-xs text-center text-muted-foreground">
                      {namedColor?.name || color}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}