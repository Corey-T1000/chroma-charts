# Chroma-Charts

A powerful tool for creating and managing beautiful, accessible color palettes for data visualizations. Built with React, TypeScript, and Recharts.

<div align="center">
  <img src="/public/og-image.svg" alt="Chroma-Charts Banner" width="100%" />
</div>

## About This Project

Chroma-Charts was developed using [bolt.new](https://bolt.new) by the design team at [authzed](https://authzed.com). Built with React, TypeScript, and Tailwind CSS, it showcases the power of modern web development tools while providing a seamless user experience for creating and managing chart color palettes.

## Features

- 🎨 **Smart Color Management**
  - Import colors from CSS variables or hex values
  - Automatic color name detection
  - Multiple color set support
  - Light/Dark mode palettes

- 📊 **Live Chart Preview**
  - Real-time visualization updates
  - Multiple chart types (Line, Bar, Pie)
  - Light/Dark mode toggle
  - Responsive design

- ♿️ **Accessibility First**
  - Auto-generated accessible color combinations
  - WCAG contrast ratio compliance
  - Color-blind friendly palette suggestions
  - Smart color distribution

- 💾 **Export Options**
  - Export as CSS variables
  - Individual set or all sets export
  - Light and dark mode variables
  - Shareable URL states

## Getting Started

1. Visit [Chroma-Charts](https://chroma-charts.netlify.app)
2. Import your colors:
   - Paste CSS variables
   - Input hex values
   - Upload a CSS file
3. Use the color picker to customize your charts
4. Export your color palette as CSS

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

2. **Customizing Colors**
   - Use the color picker to select from available colors
   - Click "Add Color" to expand the palette
   - Use "Auto-Generate" for accessible combinations

3. **Previewing**
   - See real-time updates across different chart types
   - Toggle between light and dark modes
   - View all charts with current colors

4. **Exporting**
   - Export current set or all sets as CSS
   - Copy generated CSS variables
   - Share via URL (state is preserved)

### Best Practices

- Start with your brand's core colors
- Use Auto-Generate for accessible combinations
- Test in both light and dark modes
- Keep color count minimal for clear visualization
- Create separate sets for different chart types

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

- **Color Management**: Smart parsing of multiple color formats
- **Accessibility**: WCAG-compliant color combinations
- **State Management**: URL-based state preservation
- **Responsive Design**: Mobile-friendly interface

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Recharts](https://recharts.org/) for the charting library
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Lucide](https://lucide.dev/) for the icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [bolt.new](https://bolt.new) for development platform
- [authzed](https://authzed.com) for design inspiration

---

Made with ⚡️ by [StackBlitz](https://stackblitz.com)