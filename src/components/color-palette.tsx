import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ColorConfig, NamedColor } from '@/lib/types';
import { Plus, Wand2, X, Palette, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { ColorScheme } from '@/lib/color-utils';

interface ColorPaletteProps {
  colors: ColorConfig;
  availableColors: NamedColor[];
  onColorChange: (mode: 'light' | 'dark', index: number, color: string) => void;
  onAddColor: () => void;
  onAutoGenerate: (scheme: ColorScheme) => void;
  onRemoveColor: (index: number) => void;
  maxColors?: number;
}

export function ColorPalette({ 
  colors, 
  availableColors, 
  onColorChange, 
  onAddColor,
  onAutoGenerate,
  onRemoveColor,
  maxColors
}: ColorPaletteProps) {
  const { toast } = useToast();
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>('mixed');
  
  const canAddMore = !maxColors || colors.light.length < maxColors;

  const colorSchemes: { label: string; value: ColorScheme }[] = [
    { label: 'Mixed Colors', value: 'mixed' },
    { label: 'Warm Colors', value: 'warm' },
    { label: 'Cool Colors', value: 'cool' },
    { label: 'Neutral Colors', value: 'neutral' },
    { label: 'Monochromatic', value: 'monochromatic' },
  ];

  return (
    <div className="space-y-8">
      {(['light', 'dark'] as const).map((mode) => (
        <div key={mode} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold capitalize">{mode} Mode</h2>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Palette className="mr-2 h-4 w-4" />
                    {colorSchemes.find(s => s.value === selectedScheme)?.label || 'Color Scheme'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup 
                    value={selectedScheme} 
                    onValueChange={(value) => setSelectedScheme(value as ColorScheme)}
                  >
                    {colorSchemes.map((scheme) => (
                      <DropdownMenuRadioItem
                        key={scheme.value}
                        value={scheme.value}
                        className="cursor-pointer"
                      >
                        {scheme.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAutoGenerate(selectedScheme)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
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
                            {availableColors.map((colorOption) => (
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