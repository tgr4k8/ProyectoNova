import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';

// ❌ Mantén DESACTIVADO el baseURL global
// import { API } from './config';
// axios.defaults.baseURL = API;

// 👉 Token + NORMALIZADOR global (cubre usos de axios “a pelo”)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  let url = config.url || '';
  const base = String(config.baseURL || axios.defaults.baseURL || '').replace(/\/$/, '');

  // No tocar absolutas
  if (!url || /^https?:\/\//i.test(url)) return config;

  // Evita "/api/api/..." si hay baseURL "/api" y la url también empieza por "/api/"
  if (base.endsWith('/api') && url.startsWith('/api/')) {
    url = url.replace(/^\/api\//, '/');
  }

  // Colapsa dobles barras
  url = url.replace(/^\/{2,}/, '/');

  // Asegura barra inicial
  if (!url.startsWith('/')) url = '/' + url;

  config.url = url;
  return config;
});

// ... (el resto de tu App.js igual que lo tienes)


import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Inicio from './pages/Inicio';
import Usuario from './pages/Usuario';
import Grupos from './pages/Grupos';
import ClasesPorEstilo from './pages/ClasesPorEstilo';
import Clase from './pages/Clase';
import Estilos from './pages/Estilos';
import Registro from './pages/Registro';
import Tarifas from './pages/Tarifas';
import ComoFunciona from './pages/ComoFunciona';
import VerifyEmail from './pages/VerifyEmail';

import AdminRoute from './components/AdminRoute';
import NuevoGrupo from './pages/admin/NuevoGrupo';
import NuevoEstilo from './pages/admin/NuevoEstilo';
import UsuariosAdmin from './pages/admin/Usuarios';
import LimboClases from './pages/admin/LimboClases';
import GestionClases from './pages/admin/GestionClases';
import AdminDashBoard from './pages/admin/AdminDashBoard';
import GestionEventos from './pages/admin/GestionEventos';

import NuevaClase from "./pages/profesor/NuevaClase";
import Comunidad from './pages/Comunidad';

// *** Checkout (modales) ***
import CheckoutPaso1 from './pages/Checkout/checkoutPaso1';
import CheckoutPaso2 from './pages/Checkout/checkoutPaso2';
import CheckoutResumen from './pages/Checkout/checkoutResumen';

// *** Estado global del checkout ***
import { CheckoutProvider } from './context/CheckoutContext';

function AppRoutes() {
  // Patrón de modales con background location
  const location = useLocation();
  const state = location.state && location.state.background;

  return (
    <>
      <ScrollToTop />

      {/* Rutas principales */}
      <Routes location={state || location}>
        <Route path="/admin" element={<AdminDashBoard />} />

        <Route path="/" element={<Inicio />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/usuario" element={<Usuario />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/estilos" element={<Estilos />} />
        <Route
          path="/estilos/nuevo"
          element={
            <AdminRoute>
              <NuevoEstilo />
            </AdminRoute>
          }
        />

        <Route path="/registro" element={<Registro />} />
        <Route path="/tarifas" element={<Tarifas />} />
        <Route path="/comofunciona" element={<ComoFunciona />} />

        <Route
          path="/grupos/nuevo"
          element={
            <AdminRoute>
              <NuevoGrupo />
            </AdminRoute>
          }
        />

        <Route path="/profesor/clases/nueva" element={<NuevaClase />} />

        {/* Admin */}
        <Route
          path="/admin/usuarios"
          element={
            <AdminRoute>
              <UsuariosAdmin />
            </AdminRoute>
          }
        />
        <Route path="/admin/clases/limbo" element={<LimboClases />} />
        <Route path="/admin/clases" element={<GestionClases />} />
        <Route path="/admin/eventos" element={<GestionEventos />} />

        {/* Clases */}
        <Route path="/estilos/:estiloId/clases" element={<ClasesPorEstilo />} />
        <Route path="/clases/:id" element={<Clase />} />
      </Routes>

      {/* Rutas MODALES: solo si existe background */}
      {state && (
        <Routes>
          <Route path="/checkout/paso1" element={<CheckoutPaso1 />} />
          <Route path="/checkout/paso2" element={<CheckoutPaso2 />} />
          <Route path="/checkout/resumen" element={<CheckoutResumen />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <CheckoutProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </CheckoutProvider>
  );
}
