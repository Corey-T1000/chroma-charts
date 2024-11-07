# Chroma-Charts

A powerful tool for creating and managing beautiful, accessible color palettes for data visualizations. Built with React, TypeScript, and Recharts.

<div align="center">
  <img src="/public/og-image.svg" alt="Chroma-Charts Banner" width="100%" />
</div>

## About This Project

Chroma-Charts was developed using [bolt.new](https://bolt.new) by the design team at [authzed](https://authzed.com). Built with React, TypeScript, and Tailwind CSS, it showcases the power of modern web development tools while providing a seamless user experience for creating and managing chart color palettes.

## Features

- 🎨 **Intelligent Color Management**

  - Import colors from CSS variables or hex values
  - Smart color name detection and preservation
  - Multiple color scheme support (Mixed, Warm, Cool, Neutral, Monochromatic)
  - Automatic color generation with seed preservation
  - Light/Dark mode palettes with automatic contrast adjustment

- 📊 **Live Chart Preview**

  - Real-time visualization updates
  - Multiple chart types (Line, Bar, Pie)
  - Interactive light/dark mode toggle
  - Responsive design with automatic resizing

- ♿️ **Accessibility First**

  - WCAG contrast ratio compliance
  - Color-blind friendly palette suggestions
  - Smart color distribution for optimal readability
  - Automatic contrast adjustments per mode

- 💾 **Advanced Export Options**
  - Export as CSS variables with color names
  - Individual set or all sets export
  - Light and dark mode variables
  - Shareable URL states with compressed data

## Getting Started

1. Visit [Chroma-Charts](https://chroma-charts.netlify.app)
2. Import your colors using any of these methods:
   - Paste CSS variables
   - Input hex values (one per line or CSV)
   - Upload a CSS file
3. Create color sets:
   - Use the default set or add new sets
   - Set maximum colors per set
   - Generate colors automatically
   - Fine-tune with the color picker
4. Preview in different charts
5. Export your color palette as CSS

## Usage Guide

### Importing Colors

The tool supports multiple color import formats:

1. **CSS Variables**

   ```css
   --primary: 220 100% 50%;
   --accent: 280 80% 60%;
   ```

2. **Hex Values**

   ```
   F7F6F7, F1F0F2, DEDCDF
   ```

   or

   ```
   #F7F6F7
   #F1F0F2
   #DEDCDF
   ```

3. **CSS Files**
   - Drag and drop any CSS file containing color variables

### Managing Color Sets

1. **Creating Sets**

   - Click "Add New Set" in the dropdown menu
   - Set a name and maximum color count
   - Each set maintains its own light/dark mode colors

2. **Generating Colors**

   - Choose a color scheme (Mixed, Warm, Cool, Neutral, Monochromatic)
   - Click "Generate" to create new color combinations
   - Each generation preserves color relationships while creating unique variations

3. **Customizing Colors**

   - Use the color picker to select from available colors
   - Click "Add Color" to expand the palette
   - Remove colors with the 'x' button
   - Colors automatically adjust for light/dark modes

4. **Previewing**

   - See real-time updates across different chart types
   - Toggle between light and dark modes
   - Charts automatically resize to fit the viewport

5. **Exporting**
   - Export current set or all sets as CSS
   - Copy generated CSS variables
   - Share via URL (state is preserved)
   - Color names are preserved in exports

### Best Practices

- Start with your brand's core colors by importing them
- Use different color schemes for different chart types
- Test in both light and dark modes
- Keep color count minimal for clear visualization
- Create separate sets for different purposes
- Use the automatic generation for accessible combinations

## Technical Details

### Built With

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

### Project Structure

```
src/
├── components/
│   ├── charts/      # Chart components
│   ├── ui/          # UI components
│   └── ...
├── lib/
│   ├── color-utils  # Color manipulation
│   ├── css-parser   # CSS parsing
│   └── types        # TypeScript types
└── ...
```

### Key Features Implementation

- **Color Management**: Smart parsing and preservation of color names
- **Accessibility**: WCAG-compliant color combinations with contrast checking
- **State Management**: URL-based state preservation with compression
- **Responsive Design**: Mobile-friendly interface with fluid layouts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Recharts](https://recharts.org/) for the charting library
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Lucide](https://lucide.dev/) for the icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [bolt.new](https://bolt.new) for development platform
- [authzed](https://authzed.com) for supporting open source
