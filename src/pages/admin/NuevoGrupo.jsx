import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminForms.css';

function slugify(s = '') {
    return s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // no alfanum → guiones
        .replace(/^-+|-+$/g, '');      // quita guiones extremos
}

export default function NuevoGrupo() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [clave, setClave] = useState('');          // NUEVO
    const [nivel, setNivel] = useState('');          // NUEVO
    const [imagenUrl, setImagenUrl] = useState('');  // NUEVO

    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);
    const [grupos, setGrupos] = useState([]);

    const token = localStorage.getItem('token');

    const cargarGrupos = async () => {
        try {
            const { data } = await axios.get(`/api/grupos`);
            setGrupos(data || []);
        } catch (err) {
            console.error('Error cargando grupos', err);
        }
    };

    useEffect(() => {
        cargarGrupos();
    }, []);

    // Autogenerar la clave al escribir nombre (si el usuario no la ha tocado manualmente)
    useEffect(() => {
        // Si clave está vacía o coincide con el slug del nombre anterior, autocompleta
        const auto = slugify(nombre);
        if (!clave || clave === slugify(clave)) {
            setClave(auto);
        }
        // eslint-disable-next-line
    }, [nombre]);

    const crear = async (e) => {
        e.preventDefault();
        setMsg(null); setError(null);

        const payload = {
            nombre: nombre.trim(),
            descripcion: (descripcion || '').trim() || null,
            clave: (clave || '').trim().toLowerCase(),
            nivel: (nivel || '').trim() || null,
            imagenUrl: (imagenUrl || '').trim() || null
        };

        if (!payload.nombre || !payload.clave) {
            setError('⚠️ nombre y clave son obligatorios');
            return;
        }

        try {
            const { data } = await axios.post(
                `/api/grupos`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMsg(`✅ Grupo creado: ${data.nombre}`);
            setNombre(''); setDescripcion('');
            setClave(''); setNivel(''); setImagenUrl('');
            cargarGrupos();
        } catch (e) {
            const apiError = e.response?.data?.error || 'Error creando grupo';
            setError(`⚠️ ${apiError}`);
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este grupo?')) return;
        try {
            await axios.delete(`/api/grupos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg('✅ Grupo eliminado correctamente');
            cargarGrupos();
        } catch (err) {
            const apiError = err.response?.data?.error || 'Error eliminando grupo';
            setError(`⚠️ ${apiError}`);
        }
    };

    const previewSrc = imagenUrl || (clave ? `/imagenes/${clave}.png` : '/imagenes/default.png');

    return (
        <div className="admin-forms">
            <h1>Gestión de Grupos</h1>

            <form onSubmit={crear} style={{ display: 'grid', gap: 10 }}>
                <div>
                    <label>Nombre*</label>
                    <input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        placeholder="Ej: Mercurio"
                    />
                </div>

                <div>
                    <label>Clave* (identificador URL/imagen)</label>
                    <input
                        value={clave}
                        onChange={e => setClave(slugify(e.target.value))}
                        required
                        placeholder="mercurio"
                    />
                    <small>Se usará para la imagen por defecto: <code>/imagenes/{clave || 'clave'}.png</code></small>
                </div>

                <div>
                    <label>Nivel</label>
                    <input
                        value={nivel}
                        onChange={e => setNivel(e.target.value)}
                        placeholder="Nivel principiante / infantil / avanzado…"
                    />
                </div>

                <div>
                    <label>URL de imagen (opcional)</label>
                    <input
                        value={imagenUrl}
                        onChange={e => setImagenUrl(e.target.value)}
                        placeholder="https://…"
                    />
                    <div style={{ marginTop: 6 }}>
                        <span>Preview: </span>
                        {/* mini preview de imagen */}
                        <img src={previewSrc} alt="preview" style={{ width: 64, height: 64, objectFit: 'contain', verticalAlign: 'middle' }} />
                    </div>
                </div>

                <div>
                    <label>Descripción</label>
                    <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="(opcional)"
                        rows={4}
                    />
                </div>

                <button type="submit">Crear grupo</button>
            </form>

            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <hr />
            <h2>Grupos existentes</h2>
            {grupos.length === 0 && <p>No hay grupos registrados.</p>}

            <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {grupos.map(g => {
                    const src = g.imagenUrl || (g.clave ? `/imagenes/${g.clave}.png` : '/imagenes/default.png');
                    return (
                        <li key={g.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={src} alt={g.nombre} width={48} height={48} style={{ objectFit: 'contain' }} />
                            <div style={{ flex: 1 }}>
                                <strong>{g.nombre}</strong> {g.nivel ? `— ${g.nivel}` : ''}
                                {g.descripcion && <div style={{ opacity: .8 }}>{g.descripcion}</div>}
                                <small style={{ opacity: .7 }}>clave: <code>{g.clave || '-'}</code></small>
                            </div>
                            <button
                                style={{ color: 'white', backgroundColor: 'red', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
                                onClick={() => eliminar(g.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
