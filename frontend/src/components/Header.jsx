import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `btn btn--ghost btn--sm${isActive ? ' btn--active' : ''}`;

export function Header() {
  const { user, logout, notifications } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link to="/chat" className="header__logo">
            <span className="header__logo-icon">B</span>
            Bird
          </Link>

          <nav className="header__nav">
            <NavLink to="/chat" className={navLinkClass}>
              Чат
              {notifications.total_unread > 0 && (
                <span className="header__badge">{notifications.total_unread}</span>
              )}
            </NavLink>
            <NavLink to="/users" className={navLinkClass}>
              Пользователи
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Профиль
            </NavLink>
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="app-footer">
        <Link to="/about" className="app-footer__link">
          Bird · о проекте
        </Link>
      </footer>
    </>
  );
}
