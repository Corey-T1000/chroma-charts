import { useState, useEffect } from 'react';
import { ColorPalette } from '@/components/color-palette';
import { ChartPreview } from '@/components/chart-preview';
import { CssImporter } from '@/components/css-importer';
import { Button } from '@/components/ui/button';
import {
  Download,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { exportConfig } from '@/lib/export-utils';
import { ColorConfig, NamedColor, ColorSet } from '@/lib/types';
import { parseNamedColors } from '@/lib/css-parser';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from '@/lib/compression';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ColorScheme, generateAccessiblePalette } from '@/lib/color-utils';

const defaultColors: ColorConfig = {
  light: ['#000000'],
  dark: ['#ffffff'],
  names: {},
  sets: [],
  strictMode: false,
};

export function StyleGenerator() {
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [availableColors, setAvailableColors] = useState<NamedColor[]>([]);
  const [autoGenCounter, setAutoGenCounter] = useState(0);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetSize, setNewSetSize] = useState('3');
  const [isNewSetDialogOpen, setIsNewSetDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressedState = params.get('s');

    if (compressedState) {
      try {
        const decompressed = decompressFromEncodedURIComponent(compressedState);
        const parsed = JSON.parse(decompressed);
        if (parsed.light?.length && parsed.dark?.length) {
          setColors(parsed);

          if (parsed.names) {
            const reconstructedColors: NamedColor[] = Object.entries(
              parsed.names
            ).map(([value, name]) => ({ name: name as string, value }));
            setAvailableColors(reconstructedColors);
          }
        }
      } catch (error) {
        console.warn('Failed to parse URL state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      ...colors,
      names: Object.fromEntries(
        availableColors.map((color) => [color.value, color.name])
      ),
    };
    const compressed = compressToEncodedURIComponent(
      JSON.stringify(stateToSave)
    );
    const url = new URL(window.location.href);
    url.searchParams.set('s', compressed);
    window.history.replaceState({}, '', url);
  }, [colors, availableColors]);

  const getCurrentColors = (): ColorConfig => {
    if (!activeSet) return colors;
    const currentSet = colors.sets?.find((set) => set.id === activeSet);
    return currentSet || colors;
  };

  const getActiveSetName = (): string => {
    if (!activeSet) return 'Default Set';
    const currentSet = colors.sets?.find((set) => set.id === activeSet);
    return currentSet?.name || 'Default Set';
  };

  const handleColorChange = (
    mode: 'light' | 'dark',
    index: number,
    color: string
  ) => {
    if (activeSet) {
      setColors((prev) => ({
        ...prev,
        sets: prev.sets?.map((set) =>
          set.id === activeSet
            ? {
                ...set,
                [mode]: set[mode].map((c, i) => (i === index ? color : c)),
              }
            : set
        ),
      }));
    } else {
      setColors((prev) => ({
        ...prev,
        [mode]: prev[mode].map((c, i) => (i === index ? color : c)),
      }));
    }
  };

  const handleAddColor = () => {
    const maxColors = activeSet
      ? colors.sets?.find((s) => s.id === activeSet)?.size
      : undefined;

    if (maxColors && getCurrentColors().light.length >= maxColors) {
      toast({
        title: 'Maximum colors reached',
        description: `This set is limited to ${maxColors} colors.`,
        variant: 'destructive',
      });
      return;
    }

    if (activeSet) {
      setColors((prev) => ({
        ...prev,
        sets: prev.sets?.map((set) =>
          set.id === activeSet
            ? {
                ...set,
                light: [
                  ...set.light,
                  set.light[set.light.length - 1] || '#000000',
                ],
                dark: [...set.dark, set.dark[set.dark.length - 1] || '#ffffff'],
              }
            : set
        ),
      }));
    } else {
      setColors((prev) => ({
        ...prev,
        light: [...prev.light, prev.light[prev.light.length - 1] || '#000000'],
        dark: [...prev.dark, prev.dark[prev.dark.length - 1] || '#ffffff'],
      }));
    }
  };

  const handleRemoveColor = (index: number) => {
    if (getCurrentColors().light.length <= 1) return;

    if (activeSet) {
      setColors((prev) => ({
        ...prev,
        sets: prev.sets?.map((set) =>
          set.id === activeSet
            ? {
                ...set,
                light: set.light.filter((_, i) => i !== index),
                dark: set.dark.filter((_, i) => i !== index),
              }
            : set
        ),
      }));
    } else {
      setColors((prev) => ({
        ...prev,
        light: prev.light.filter((_, i) => i !== index),
        dark: prev.dark.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAutoGenerate = (scheme: ColorScheme = 'mixed') => {
    const currentColors = getCurrentColors();
    const currentSize = currentColors.light.length;
    
    const { light, dark } = generateAccessiblePalette(
      availableColors,
      currentSize,
      autoGenCounter + Math.random() * 1000,
      scheme,
      currentColors.strictMode
    );

    if (light.length > 0 && dark.length > 0) {
      if (activeSet) {
        setColors((prev) => ({
          ...prev,
          sets: prev.sets?.map((set) =>
            set.id === activeSet
              ? {
                  ...set,
                  light,
                  dark,
                }
              : set
          ),
        }));
      } else {
        setColors((prev) => ({
          ...prev,
          light,
          dark,
        }));
      }

      setAutoGenCounter((prev) => prev + 1);
      toast({
        title: "Colors generated",
        description: `Generated ${scheme} color palette with ${currentSize} colors.`,
      });
    }
  };

  const handleStrictModeChange = (enabled: boolean) => {
    if (activeSet) {
      setColors((prev) => ({
        ...prev,
        sets: prev.sets?.map((set) =>
          set.id === activeSet
            ? {
                ...set,
                strictMode: enabled,
              }
            : set
        ),
      }));
    } else {
      setColors((prev) => ({
        ...prev,
        strictMode: enabled,
      }));
    }
  };

  const handleImport = (importedColors: ColorConfig, cssText?: string) => {
    if (cssText) {
      const namedColors = parseNamedColors(cssText);
      setAvailableColors(namedColors);

      if (namedColors.length > 0) {
        const names = Object.fromEntries(
          namedColors.map((color) => [color.value, color.name])
        );
        setColors({
          light: [namedColors[0].value],
          dark: [namedColors[0].value],
          names,
          sets: [],
          strictMode: true,
        });
        return;
      }
    }

    if (importedColors.light.length > 0 || importedColors.dark.length > 0) {
      setColors({
        ...importedColors,
        light: [importedColors.light[0] || '#000000'],
        dark: [importedColors.dark[0] || '#ffffff'],
        sets: [],
        strictMode: true,
      });
    }
  };

  const handleExport = (type: 'current' | 'all') => {
    const colorConfig = type === 'current' 
      ? getCurrentColors()
      : {
          ...colors,
          names: Object.fromEntries(
            availableColors.map((color) => [color.value, color.name])
          ),
        };
    exportConfig(colorConfig, type, activeSet);
  };

  const handleDeleteSet = (setId: string) => {
    setColors((prev) => ({
      ...prev,
      sets: prev.sets?.filter((set) => set.id !== setId),
    }));
    if (activeSet === setId) {
      setActiveSet(null);
    }
  };

  const handleDuplicateSet = (setId?: string) => {
    let setToDuplicate: ColorSet | ColorConfig;
    let sourceName: string;

    if (setId) {
      const foundSet = colors.sets?.find((set) => set.id === setId);
      if (!foundSet) return;
      setToDuplicate = foundSet;
      sourceName = foundSet.name;
    } else {
      // Duplicate default set
      setToDuplicate = {
        light: [...colors.light],
        dark: [...colors.dark],
        strictMode: colors.strictMode,
        size: colors.light.length
      };
      sourceName = colors.defaultSetName || 'Default Set';
    }

    const newSet: ColorSet = {
      id: `set-${Date.now()}`,
      name: `${sourceName} (Copy)`,
      size: setToDuplicate.size || setToDuplicate.light.length,
      light: [...setToDuplicate.light],
      dark: [...setToDuplicate.dark],
      strictMode: setToDuplicate.strictMode
    };

    setColors((prev) => ({
      ...prev,
      sets: [...(prev.sets || []), newSet],
    }));

    toast({
      title: "Set duplicated",
      description: `Created a copy of "${sourceName}".`,
    });
  };

  const handleCreateNewSet = () => {
    const currentColors = getCurrentColors();
    const currentName = getActiveSetName();
    
    // Find the highest number in existing set names with the same base name
    const baseNameRegex = new RegExp(`^${currentName}(?: (\\d+))?$`);
    const existingNumbers = (colors.sets || [])
      .map(set => {
        const match = set.name.match(baseNameRegex);
        return match ? parseInt(match[1] || '1') : 0;
      })
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 2;

    const newSet: ColorSet = {
      id: `set-${Date.now()}`,
      name: `${currentName} ${nextNumber}`,
      size: currentColors.light.length,
      light: [...currentColors.light],
      dark: [...currentColors.dark],
      strictMode: currentColors.strictMode
    };

    setColors((prev) => ({
      ...prev,
      sets: [...(prev.sets || []), newSet],
    }));

    setActiveSet(newSet.id);
    toast({
      title: "Set created",
      description: `Created new color set "${newSet.name}".`,
    });
  };

  const generateCssText = () => {
    const getColorName = (color: string): string | undefined => {
      const namedColor = availableColors.find((c) => c.value === color);
      return namedColor?.name;
    };

    const generateColorBlock = (colors: string[], setName?: string) => {
      const comment = setName ? `/* ${setName} */\n` : '';
      const variables = colors
        .map((color) => {
          const name = getColorName(color);
          const comment = name ? ` /* ${name} */` : '';
          return `  ${
            name ? `--${name}` : `--chart-${colors.indexOf(color) + 1}`
          }: ${color};${comment}`;
        })
        .join('\n');
      return `${comment}:root {\n${variables}\n}\n\n.dark {\n${variables}\n}`;
    };

    let css = generateColorBlock(colors.light, 'Default Set');

    if (colors.sets?.length) {
      colors.sets.forEach((set) => {
        css += '\n\n' + generateColorBlock(set.light, set.name);
      });
    }

    return css;
  };

  return (
    <div className="flex justify-center min-h-screen w-full bg-background">
      <div className="flex w-full max-w-7xl">
        <div className="w-[400px] border-r bg-card flex flex-col">
          <div className="flex h-14 items-center justify-between px-4 border-b">
            <h1 className="text-lg uppercase tracking-widest font-semibold">
              Chroma-Charts
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {getActiveSetName()}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Color Sets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center justify-between group"
                  onClick={() => setActiveSet(null)}
                >
                  <span>Default Set</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSet();
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
                {colors.sets?.map((set) => (
                  <DropdownMenuItem
                    key={set.id}
                    className="flex items-center justify-between group"
                    onClick={() => setActiveSet(set.id)}
                  >
                    <span>{set.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSet(set.id);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSet(set.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleCreateNewSet}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <ChartPreview colors={getCurrentColors()} />
          </div>
        </div>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-8">
              <CssImporter onImport={handleImport} />

              <Card>
                <CardContent className="pt-6">
                  <ColorPalette
                    colors={getCurrentColors()}
                    availableColors={availableColors}
                    onColorChange={handleColorChange}
                    onAddColor={handleAddColor}
                    onAutoGenerate={handleAutoGenerate}
                    onRemoveColor={handleRemoveColor}
                    onStrictModeChange={handleStrictModeChange}
                    maxColors={
                      activeSet
                        ? colors.sets?.find((s) => s.id === activeSet)?.size
                        : undefined
                    }
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExport('current')}>
                        Export Current Set
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('all')}>
                        Export All Sets
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="h-[200px] rounded-lg border">
                  <pre className="p-4 font-mono text-sm">
                    {generateCssText()}
                  </pre>
                </ScrollArea>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground border-t pt-8">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">About This Project</h4>
                  <p>
                    Chroma-Charts was developed using <a 
                      href="https://bolt.new" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      bolt.new
                    </a> by the design team at{' '}
                    <a 
                      href="https://authzed.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      authzed
                    </a>
                    . Built with React, TypeScript, and Tailwind CSS, it showcases the power of 
                    modern web development tools while providing a seamless user experience for 
                    creating and managing chart color palettes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleGenerator;