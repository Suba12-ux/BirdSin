import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout, notifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.trim() || user.email?.[0]?.toUpperCase() || '?'
    : '?';

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link to="/chat" className="header__logo">
            <span className="header__logo-icon">B</span>
            Bird
          </Link>

          <nav className="header__nav">
            <Link to="/chat" className={`btn btn--ghost btn--sm ${location.pathname.startsWith('/chat') ? 'btn--active' : ''}`}>
              Чат
              {notifications.total_unread > 0 && (
                <span className="header__badge">{notifications.total_unread}</span>
              )}
            </Link>
            <Link to="/users" className={`btn btn--ghost btn--sm ${location.pathname === '/users' ? 'btn--active' : ''}`}>
              Пользователи
            </Link>
            <Link to="/profile" className={`btn btn--ghost btn--sm ${location.pathname === '/profile' ? 'btn--active' : ''}`}>
              Профиль
            </Link>
            <Link to="/about" className={`btn btn--ghost btn--sm ${location.pathname === '/about' ? 'btn--active' : ''}`}>
              Об авторе
            </Link>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <Outlet />
    </>
  );
}
