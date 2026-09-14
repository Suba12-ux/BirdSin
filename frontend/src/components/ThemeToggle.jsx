import { useTheme } from '../context/ThemeContext';

/**
 * Плавающая кнопка переключения между темами «Неон» и «Black velvet».
 * Отображается на всех страницах (включая формы входа/регистрации).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isBlackVelvet = theme === 'black-velvet';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isBlackVelvet}
      title={
        isBlackVelvet
          ? 'Переключить на тему «Неон»'
          : 'Переключить на тему «Black velvet»'
      }
    >
      <span className="theme-toggle__swatch" aria-hidden="true" />
      <span className="theme-toggle__label">
        {isBlackVelvet ? 'Неон' : 'Black velvet'}
      </span>
    </button>
  );
}
