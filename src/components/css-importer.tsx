import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUp, Code2, Upload, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { parseCssColors } from '@/lib/css-parser';
import { ColorConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CssImporterProps {
  onImport: (colors: ColorConfig, cssText?: string) => void;
}

export function CssImporter({ onImport }: CssImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [cssText, setCssText] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const { toast } = useToast();

  const cleanHexValue = (hex: string): string | null => {
    const cleaned = hex.replace(/O/g, '0').toUpperCase();
    if (/^[0-9A-F]{6}$/.test(cleaned)) {
      return cleaned;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const colors = parseCssColors(text);
    onImport(colors, text);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/css') {
      handleFile(file);
    }
  };

  const handlePaste = () => {
    if (!cssText.trim()) return;

    // Try parsing as CSS first
    if (cssText.includes('--') || cssText.includes('#')) {
      try {
        const colors = parseCssColors(cssText);
        onImport(colors, cssText);
        setCssText('');
        return;
      } catch (error) {
        // If CSS parsing fails, continue to hex parsing
      }
    }

    // Split by common delimiters and clean up
    const hexValues = cssText
      .split(/[\s,;\n]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((value) => value.replace(/^#/, '')); // Remove # if present

    const validHexColors = hexValues
      .map((hex) => cleanHexValue(hex))
      .filter((hex): hex is string => hex !== null)
      .map((hex) => `#${hex}`);

    if (validHexColors.length > 0) {
      if (validHexColors.length !== hexValues.length) {
        toast({
          title: 'Warning',
          description: 'Some color values were invalid and have been skipped.',
          variant: 'destructive',
        });
      }

      const colorConfig: ColorConfig = {
        light: validHexColors,
        dark: [...validHexColors].reverse(),
      };
      onImport(colorConfig);
    } else {
      toast({
        title: 'Error',
        description: 'No valid color values found. Please check your input.',
        variant: 'destructive',
      });
    }
    setCssText('');
  };

  return (
    <div className="grid gap-6">
      <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quick Start Guide</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isGuideOpen ? "rotate-180" : ""
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="space-y-4 mt-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Getting Started</h4>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  <strong>Import Colors:</strong> Start by importing your existing colors using any of the supported formats below
                </li>
                <li>
                  <strong>Create Sets:</strong> Use the dropdown menu to create different color sets for various chart types
                </li>
                <li>
                  <strong>Generate Palettes:</strong> Choose a color scheme and click "Generate" to create accessible combinations
                </li>
                <li>
                  <strong>Preview & Adjust:</strong> Test your colors in different charts and modes, fine-tune as needed
                </li>
                <li>
                  <strong>Export:</strong> Download your color palette as CSS variables or share via URL
                </li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Supported Formats</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  CSS Variables with HSL values:{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    --color-name: 220 100% 50%
                  </code>
                </li>
                <li>
                  Hex values (CSV or one per line):{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    F7F6F7, F1F0F2, DEDCDF
                  </code>
                </li>
                <li>CSS files with color variables</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Pro Tips</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use different color schemes for different types of charts</li>
                <li>Test your palettes in both light and dark modes</li>
                <li>Keep color count minimal for better readability</li>
                <li>Save different sets for various use cases</li>
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Import Colors</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Drag and drop a CSS file or paste hex values
        </p>
        <Input
          type="file"
          accept=".css"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          id="css-file"
        />
        <Button variant="outline" className="mt-4" asChild>
          <label htmlFor="css-file" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </label>
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Or Paste Colors
        </h3>
        <Textarea
          placeholder="Paste CSS variables, hex values (one per line or CSV), e.g.:
F7F6F7, F1F0F2, DEDCDF
or
--primary: 220 100% 50%
--secondary: 200 100% 45%"
          value={cssText}
          onChange={(e) => setCssText(e.target.value)}
          className="min-h-[200px] font-mono"
        />
        <Button onClick={handlePaste} disabled={!cssText.trim()}>
          <Upload className="mr-2 h-4 w-4" />
          Import Colors
        </Button>
      </div>
    </div>
  );
}