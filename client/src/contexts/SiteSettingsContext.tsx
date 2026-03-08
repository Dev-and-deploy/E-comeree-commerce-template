// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';

// interface SiteSettings {
//   id?: string;
//   site_name?: string;
//   logo_url?: string;
//   favicon_url?: string;
//   banner_images?: string[];
//   hero_title?: string;
//   hero_subtitle?: string;
//   primary_color?: string;
//   secondary_color?: string;
//   accent_color?: string;
//   template?: string;
//   header_content?: any;
//   footer_content?: any;
//   seo_title?: string;
//   seo_description?: string;
//   social_links?: any;
//   created_at?: string;
//   updated_at?: string;
// }

// interface SiteSettingsContextType {
//   settings: SiteSettings | null;
//   isLoading: boolean;
//   error: string | null;
// }

// const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [settings, setSettings] = useState<SiteSettings | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { data, isLoading: queryIsLoading, error: queryError } = useQuery({
//     queryKey: ['site-settings'],
//     queryFn: async () => {
//       const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      
//       if (error) {
//         throw new Error(error.message);
//       }
      
//       return data;
//     },
//     retry: 1,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   useEffect(() => {
//     setIsLoading(queryIsLoading);
//     setError(queryError ? (queryError as Error).message : null);
    
//     if (data) {
//       setSettings(data);
//     }
//   }, [data, queryIsLoading, queryError]);

//   return (
//     <SiteSettingsContext.Provider value={{ settings, isLoading, error }}>
//       {children}
//     </SiteSettingsContext.Provider>
//   );
// };

// export const useSiteSettings = (): SiteSettingsContextType => {
//   const context = useContext(SiteSettingsContext);
//   if (!context) {
//     throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
//   }
//   return context;
// };