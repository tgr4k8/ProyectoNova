import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { API, BASE } from '../config';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div>
            <h2>Bienvenido, {user.name}</h2>
            <p>Email: {user.email}</p>
            <button onClick={logout}>Cerrar sesión</button>
        </div>
    );
}
