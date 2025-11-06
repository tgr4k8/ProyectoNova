import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function UserIcon({ className = 'user-icon' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 3.582-8 8h2a6 6 0 0 1 12 0h2c0-4.418-3.582-8-8-8z" />
    </svg>
  );
}

export default function Header() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [open, setOpen] = useState(false);

  // Bloquea/desbloquea scroll cuando el drawer está abierto
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  // Cierra el drawer al cambiar de ruta
  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/auth/perfil`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsuario(res.data))
      .catch(() => { });
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/auth/login`, { email, contrasena });
      localStorage.setItem('token', res.data.token);
      setEmail(''); setContrasena(''); setError('');
      window.location.reload();
    } catch {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const tipo = (usuario?.tipo || '').toLowerCase();
  const isAdmin = tipo === 'administrador';
  const isProfesor = tipo === 'profesor';
  const saludoNombre = usuario?.nombre || (usuario?.email ? usuario.email.split('@')[0] : '') || 'bailarín';

  return (
    <>
      {/* Backdrop y Drawer (solo visible cuando open=true) */}
      <div className={open ? 'drawer-backdrop open' : 'drawer-backdrop'} onClick={() => setOpen(false)} />
      <aside className={open ? 'side-drawer open' : 'side-drawer'} role="dialog" aria-label="Menú de navegación">
        <header>
          <Link to="/" onClick={() => setOpen(false)}><img src="/logo.png" alt="Logo" /></Link>
          <button className="close-x" aria-label="Cerrar menú" onClick={() => setOpen(false)}>×</button>
        </header>

        <nav className="drawer-nav">
          <ul>
            {isAdmin && <li><Link to="/admin">Administración</Link></li>}
            <li><Link to="/grupos">Grupos</Link></li>
            <li><Link to="/tarifas">Tarifas</Link></li>
            <li><Link to="/comunidad">Comunidad</Link></li>
            {isProfesor && !isAdmin && <li><Link to="/profesor/clases/nueva">Nueva clase</Link></li>}
            {token && <li><Link to="/usuario">Mi perfil</Link></li>}
          </ul>
        </nav>

        <div className="drawer-footer">
          {token ? (
            <button className="logout" onClick={handleLogout}>Cerrar sesión</button>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button type="submit">Iniciar sesión</button>
              <button type="button" onClick={() => navigate('/registro')}>Registrarse</button>
              {error && <p className="error">{error}</p>}
            </form>
          )}
        </div>
      </aside>

      {/* Header fijo */}
      <header className="header">
        <div className="logo">
          <Link to="/"><img src="/logo.png" alt="Logo" /></Link>
        </div>

        {/* NAV + AUTH visibles en DESKTOP; ocultos en móvil vía CSS */}
        <nav className="navbar" aria-label="Navegación principal">
          <ul>
            {isAdmin && <li><Link to="/admin">Administración</Link></li>}
            <li><Link to="/grupos">Grupos</Link></li>
            <li><Link to="/tarifas">Tarifas</Link></li>
            <li><Link to="/comunidad">Comunidad</Link></li>
            {isProfesor && !isAdmin && (
              <li><Link to="/profesor/clases/nueva">Nueva clase</Link></li>
            )}
            {token && (
              <li>
                <Link to="/usuario" className="perfil-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <UserIcon /><span>Mi perfil</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="auth-section">
          {token ? (
            <div className="usuario-logueado" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="saludo">A bailar, {saludoNombre}!</span>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button type="submit">Iniciar sesión</button>
              <button type="button" onClick={() => navigate('/registro')}>Registrarse</button>
            </form>
          )}
        </div>

        {/* Botón Menú solo en MÓVIL (se oculta en desktop por CSS) */}
        <button className="menu-button" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <span>Menú</span>
          <span className="dots"><i></i><i></i><i></i></span>
        </button>
      </header>
    </>
  );
}
