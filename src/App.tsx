import { ThemeProvider } from '@/components/theme-provider';
import { StyleGenerator } from '@/components/style-generator';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <StyleGenerator />
    </ThemeProvider>
  );
}

export default App;