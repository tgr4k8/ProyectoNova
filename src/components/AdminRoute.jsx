// src/components/AdminRoute.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API, BASE } from '../config';

export default function AdminRoute({ children }) {
    const [estado, setEstado] = useState('cargando'); // cargando | ok | no
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return setEstado('no');
        axios.get(`/api/auth/perfil`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setEstado(res.data?.tipo === 'administrador' ? 'ok' : 'no'))
            .catch(() => setEstado('no'));
    }, [token]);

    if (estado === 'cargando') return <p>Cargando…</p>;
    if (estado === 'no') return <h2>403 · Solo administradores</h2>;
    return children;
}
