import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import { Loader } from './components/Loader';

/**
 * Ленивая загрузка страниц — код каждой страницы попадает
 * в отдельный chunk и подгружается только при переходе.
 */
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() =>
  import('./pages/Register').then((m) => ({ default: m.Register }))
);
const Chat = lazy(() => import('./pages/Chat').then((m) => ({ default: m.Chat })));
const Profile = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.Profile }))
);
const Users = lazy(() => import('./pages/Users').then((m) => ({ default: m.Users })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Публичные страницы */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Защищённые страницы — с Header */}
        <Route
          element={
            <ProtectedRoute>
              <Header />
            </ProtectedRoute>
          }
        >
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Редиректы */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Suspense>
  );
}
