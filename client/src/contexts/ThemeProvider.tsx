// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useSiteSettings } from './SiteSettingsContext';

// interface ThemeContextType {
//   theme: string;
//   setTheme: (theme: string) => void;
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { settings } = useSiteSettings();
//   const [theme, setThemeState] = useState<string>('minimal');

//   useEffect(() => {
//     // Update theme when settings change
//     if (settings?.template) {
//       setThemeState(settings.template);
//     } else {
//       setThemeState('minimal');
//     }
//   }, [settings]);

//   useEffect(() => {
//     // Apply theme classes to body
//     document.body.classList.remove('theme-minimal', 'theme-premium', 'theme-modern');
//     document.body.classList.add(`theme-${theme}`);
//   }, [theme]);

//   const setTheme = (newTheme: string) => {
//     setThemeState(newTheme);
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = (): ThemeContextType => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };