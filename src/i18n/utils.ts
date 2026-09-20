import { ui, defaultLang, languages, type SupportedLocale, type TranslationKey } from './ui';

/**
 * Extracts language code from the current URL pathname.
 */
export function getLangFromUrl(url: URL): SupportedLocale {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in ui) {
    return lang as SupportedLocale;
  }
  return defaultLang;
}

/**
 * Provides translation helper for a specific language.
 */
export function useTranslations(lang: SupportedLocale) {
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const dict = ui[lang] || ui[defaultLang];
    let translation: string = dict[key] || ui[defaultLang][key] || key;
    
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    
    return translation;
  };
}

/**
 * Generates localized path for a given target language.
 * Default locale 'en' is mounted at root '/' (prefixDefaultLocale: false).
 */
export function getLocalizedPath(path: string, targetLang: SupportedLocale): string {
  // Normalize path removing any existing locale prefix
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length > 0 && segments[0] in languages) {
    segments.shift(); // remove existing locale prefix
  }
  
  const cleanPath = segments.join('/');
  
  if (targetLang === defaultLang) {
    return cleanPath ? `/${cleanPath}/` : '/';
  }
  
  return cleanPath ? `/${targetLang}/${cleanPath}/` : `/${targetLang}/`;
}

/**
 * Generates full hreflang alternate URLs for SEO.
 */
export function getAlternateLinks(baseUrl: string, currentPath: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const segments = currentPath.split('/').filter(Boolean);
  
  if (segments.length > 0 && segments[0] in languages) {
    segments.shift();
  }
  const cleanPath = segments.join('/');

  const links: { lang: string; href: string }[] = (Object.keys(languages) as SupportedLocale[]).map((lang) => {
    const path = lang === defaultLang 
      ? (cleanPath ? `/${cleanPath}/` : '/')
      : (cleanPath ? `/${lang}/${cleanPath}/` : `/${lang}/`);
    return {
      lang,
      href: `${normalizedBase}${path}`,
    };
  });

  // Add x-default pointing to defaultLocale (en)
  const defaultHref = `${normalizedBase}${cleanPath ? `/${cleanPath}/` : '/'}`;
  links.push({
    lang: 'x-default',
    href: defaultHref,
  });

  return links;
}
