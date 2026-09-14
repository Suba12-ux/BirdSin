import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Доступные темы.
 * «neon» — базовая тема, её стили всегда подключены через src/index.css.
 * «black-velvet» — альтернативный полный набор стилей из src/styles/Black_velvet/,
 * который подключается поверх базового (те же селекторы, другая палитра).
 */
export const THEMES = {
  neon: { label: 'Неон' },
  'black-velvet': { label: 'Black velvet' },
};

export const DEFAULT_THEME = 'neon';

const STORAGE_KEY = 'bird_theme';
const THEME_CSS_ATTR = 'data-theme-css';

/** URL-ы CSS-файлов темы Black_velvet (обрабатываются Vite отдельно, как ассеты). */
const blackVelvetStyleLoaders = import.meta.glob('../styles/Black_velvet/*.css', {
  query: '?url',
  import: 'default',
});

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
  } catch {
    // localStorage недоступен — остаёмся на базовой теме
  }
  return DEFAULT_THEME;
}

/** Удалить ранее подключённые <link> альтернативной темы. */
function clearThemeLinks() {
  document.querySelectorAll(`link[${THEME_CSS_ATTR}]`).forEach((link) => link.remove());
}

/**
 * Подключить CSS-файлы темы. isActive() позволяет отменить загрузку,
 * если пользователь успел переключить тему, пока файлы грузились.
 */
async function applyThemeLinks(theme, isActive) {
  if (theme !== 'black-velvet') return;

  // import.meta.glob возвращает ключи в алфавитном порядке — порядок загрузки стабилен.
  for (const load of Object.values(blackVelvetStyleLoaders)) {
    if (!isActive()) return;
    const href = await load();
    if (!isActive()) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(THEME_CSS_ATTR, '');
    document.head.appendChild(link);
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Атрибут на <html> — полезно для отладки и будущих CSS-хуков по теме.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    clearThemeLinks();
    applyThemeLinks(theme, () => active);

    return () => {
      active = false;
    };
  }, [theme]);

  const changeTheme = useCallback((nextTheme) => {
    setTheme(nextTheme && THEMES[nextTheme] ? nextTheme : DEFAULT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === 'black-velvet' ? DEFAULT_THEME : 'black-velvet'
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
