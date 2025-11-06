import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { assetUrl } from '../../utils/assets';
import './AdminForms.css';


function slugify(s = '') {
    return s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function NuevoEstilo() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [clave, setClave] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [imagenUrl, setImagenUrl] = useState('');
    const [grupos, setGrupos] = useState([]);
    const [estilos, setEstilos] = useState([]);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);



    const authHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    async function loadData() {
        try {
            const [rg, re] = await Promise.all([
                axios.get(`/api/grupos`, { headers: { ...authHeader() } }),
                axios.get(`/api/estilos`, { headers: { ...authHeader() } }),
            ]);
            setGrupos(rg.data || []);
            setEstilos(re.data || []);
        } catch {
            setGrupos([]);
            setEstilos([]);
        }
    }

    useEffect(() => {
        loadData();
        // eslint-disable-next-line
    }, []);

    // Autogenerar clave desde nombre (si el usuario no la está escribiendo a mano)
    useEffect(() => {
        const auto = slugify(nombre);
        if (!clave || clave === slugify(clave)) {
            setClave(auto);
        }
        // eslint-disable-next-line
    }, [nombre]);

    const crear = async (e) => {
        e.preventDefault();
        setMsg(null);
        setError(null);

        if (!nombre.trim() || !grupoId) {
            setError('⚠️ Nombre y grupo son obligatorios');
            return;
        }

        try {
            const payload = {
                nombre: nombre.trim(),
                descripcion: (descripcion || '').trim() || null,
                clave: (clave || '').trim() || null,
                grupoId: Number(grupoId),
                imagenUrl: (imagenUrl || '').trim() || null,
            };
            await axios.post(`/api/estilos`, payload, {
                headers: { 'Content-Type': 'application/json', ...authHeader() },
            });
            setMsg('✅ Estilo creado');
            setNombre('');
            setDescripcion('');
            setClave('');
            setGrupoId('');
            setImagenUrl('');
            // recargar listado
            await loadData();
        } catch (e2) {
            setError(
                e2?.response?.data?.detalle ||
                e2?.response?.data?.error ||
                'Error creando estilo'
            );
        }
    };

    async function eliminarEstilo(id) {
        if (!id) return;
        const ok = window.confirm('¿Seguro que quieres eliminar este estilo? Esta acción no se puede deshacer.');
        if (!ok) return;

        setError(null);
        setMsg(null);
        setDeletingId(id);
        try {
            await axios.delete(`/api/estilos/${id}`, {
                headers: { ...authHeader() },
            });
            // Optimista: quitamos de la lista sin volver a pedir
            setEstilos((prev) => prev.filter((e) => e.id !== id));
            setMsg('🗑️ Estilo eliminado.');
        } catch (e2) {
            const serverMsg =
                e2?.response?.data?.detalle ||
                e2?.response?.data?.error ||
                'No se pudo eliminar el estilo';
            setError(serverMsg);
        } finally {
            setDeletingId(null);
        }
    }

    const previewSrc =
        assetUrl(imagenUrl) ||
        (clave ? `/imagenes/${clave}.png` : '/imagenes/default.png');
    const img = (e) =>
        assetUrl(e.imagenUrl) ||
        (e.clave ? `/imagenes/${e.clave}.png` : '/imagenes/default.png');

    return (
        <div className="admin-forms">
            <h1>Nuevo estilo</h1>

            <form
                onSubmit={crear}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
            >
                <div>
                    <label>Nombre</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>

                <div>
                    <label>Grupo</label>
                    <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)} required>
                        <option value="">—</option>
                        {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Clave (opcional)</label>
                    <input
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="slug del estilo"
                    />
                </div>

                <div>
                    <label>URL de imagen (opcional)</label>
                    <input
                        value={imagenUrl}
                        onChange={(e) => setImagenUrl(e.target.value)}
                        placeholder="https://… o /imagenes/bachata.png"
                    />
                    <div style={{ marginTop: 6 }}>
                        <span>Preview: </span>
                        <img
                            src={previewSrc}
                            alt="preview"
                            style={{ width: 64, height: 64, objectFit: 'contain', verticalAlign: 'middle' }}
                        />
                    </div>
                </div>

                <div>
                    <label>Descripción (opcional)</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
                </div>

                <div style={{ alignSelf: 'end' }}>
                    <button type="submit">Guardar</button>
                </div>

                {msg && (
                    <div className="ok" style={{ gridColumn: '1 / -1' }}>
                        {msg}
                    </div>
                )}
                {error && (
                    <div className="error" style={{ gridColumn: '1 / -1' }}>
                        {error}
                    </div>
                )}
            </form>

            <h2 style={{ marginTop: 24 }}>Estilos existentes</h2>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                {estilos.map((e) => (
                    <li
                        key={e.id}
                        style={{
                            border: '1px solid #eee',
                            borderRadius: 8,
                            padding: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <img
                            src={img(e)}
                            alt={e.nombre}
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                        />
                        <div style={{ flex: 1 }}>
                            <strong>{e.nombre}</strong>
                            {e.Grupo && ` — Grupo: ${e.Grupo.nombre}`}
                        </div>
                        <button
                            onClick={() => eliminarEstilo(e.id)}
                            disabled={deletingId === e.id}
                            style={{
                                background: '#e53935',
                                color: 'white',
                                border: 0,
                                padding: '6px 10px',
                                borderRadius: 6,
                                cursor: deletingId === e.id ? 'not-allowed' : 'pointer',
                            }}
                            title="Eliminar estilo"
                        >
                            {deletingId === e.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
