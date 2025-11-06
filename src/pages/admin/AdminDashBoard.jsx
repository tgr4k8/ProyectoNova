import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const items = [
        { to: '/admin/usuarios', label: 'Gestionar usuarios', desc: 'Altas, roles y verificación' },
        { to: '/grupos/nuevo', label: 'Nuevo grupo', desc: 'Crea un grupo y su información' },
        { to: '/estilos/nuevo', label: 'Nuevo estilo', desc: 'Añade estilos dentro de un grupo' },
        { to: '/admin/clases/limbo', label: 'Propuestas de clases', desc: 'Revisión y aprobación' },
        { to: '/profesor/clases/nueva', label: 'Nueva clase', desc: 'Crear clase manualmente' },
        { to: '/admin/clases', label: 'Gestionar clases', desc: 'Editar / eliminar clases' },
        { to: '/admin/eventos', label: 'Gestionar eventos', desc: 'Editar / eliminar eventos' },
    ];

    return (
        <div className="admin-dash">
            <div className="admin-dash__header">
                <h1>Administración</h1>
                <p className="muted">Accesos rápidos a la gestión del sitio.</p>
            </div>

            <div className="admin-dash__grid">
                {items.map((it) => (
                    <Link key={it.to} to={it.to} className="admin-card">
                        <div className="admin-card__title">{it.label}</div>
                        <div className="admin-card__desc">{it.desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
