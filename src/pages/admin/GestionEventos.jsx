// client/src/pages/admin/GestionEventos.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './AdminForms.css';

export default function GestionEventos() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Filtros
    const hoy = useMemo(() => new Date(), []);
    const [filtro, setFiltro] = useState({
        year: String(hoy.getFullYear()),
        month: String(hoy.getMonth() + 1), // 1..12
        from: '',
        to: ''
    });
    const [search, setSearch] = useState('');

    // Edición
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        fecha: '',
        descripcion: '',
        imagenUrl: '',
        linkUrl: ''
    });

    const authHeader = () => {
        const t = localStorage.getItem('token');
        return t ? { Authorization: `Bearer ${t}` } : {};
    };

    function yyyymmdd(d) {
        if (!d || isNaN(d.getTime?.())) return '';
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${m}-${day}`;
    }

    async function cargarEventos() {
        try {
            setLoading(true);
            setMsg('');
            const params = {};
            // Si hay rango, se prioriza sobre mes/año
            if (filtro.from && filtro.to) {
                params.from = filtro.from;
                params.to = filtro.to;
            } else {
                if (filtro.year) params.year = Number(filtro.year);
                if (filtro.month) params.month = Number(filtro.month);
            }
            const { data } = await axios.get('/api/eventos', {
                params,
                headers: { ...authHeader() }
            });
            const arr = Array.isArray(data) ? data : [];
            const bySearch = search.trim()
                ? arr.filter(e =>
                    (e.nombre || '').toLowerCase().includes(search.trim().toLowerCase())
                )
                : arr;
            setEventos(bySearch);
        } catch (e) {
            setEventos([]);
            setMsg(e?.response?.data?.error || 'Error cargando eventos.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { cargarEventos(); /* on mount */ }, []);
    useEffect(() => { cargarEventos(); }, [filtro.year, filtro.month, filtro.from, filtro.to, search]);

    function openEdit(ev) {
        setEditId(ev.id);
        setForm({
            nombre: ev.nombre || '',
            fecha: (ev.fecha || '').slice(0, 10),
            descripcion: ev.descripcion || '',
            imagenUrl: ev.imagenUrl || '',
            linkUrl: ev.linkUrl || ''
        });
    }
    function cancelEdit() {
        setEditId(null);
    }
    function onEditChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function saveEdit() {
        try {
            const body = {
                nombre: (form.nombre || '').trim(),
                fecha: form.fecha, // YYYY-MM-DD
                descripcion: (form.descripcion || '').trim() || null,
                imagenUrl: (form.imagenUrl || '').trim() || null,
                linkUrl: (form.linkUrl || '').trim() || null
            };
            if (!body.nombre || !body.fecha) {
                setMsg('“nombre” y “fecha” son obligatorios.');
                return;
            }
            await axios.patch(`/api/eventos/${editId}`, body, { headers: { ...authHeader() } });
            cancelEdit();
            await cargarEventos();
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Error actualizando evento.');
        }
    }

    async function removeEvento(id) {
        if (!window.confirm('¿Seguro que quieres eliminar este evento?')) return;
        try {
            await axios.delete(`/api/eventos/${id}`, { headers: { ...authHeader() } });
            await cargarEventos();
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Error eliminando evento.');
        }
    }

    // Subida de imagen -> /api/eventos/upload-imagen
    async function uploadImagen(file) {
        if (!file) return;
        const fd = new FormData();
        fd.append('imagen', file);
        try {
            const { data } = await axios.post('/api/eventos/upload-imagen', fd, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            // El server devuelve { url, absoluteUrl }
            const finalUrl = data?.absoluteUrl || data?.url;
            if (finalUrl) {
                setForm(f => ({ ...f, imagenUrl: finalUrl }));
            }
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Error subiendo imagen.');
        }
    }

    // Años para desplegable cómodo (actual ± 4)
    const years = useMemo(() => {
        const y = hoy.getFullYear();
        return Array.from({ length: 9 }, (_, i) => String(y - 4 + i));
    }, [hoy]);
    const months = [
        ['1', 'Enero'], ['2', 'Febrero'], ['3', 'Marzo'], ['4', 'Abril'],
        ['5', 'Mayo'], ['6', 'Junio'], ['7', 'Julio'], ['8', 'Agosto'],
        ['9', 'Septiembre'], ['10', 'Octubre'], ['11', 'Noviembre'], ['12', 'Diciembre']
    ];

    return (
        <div className="admin-forms">
            <h1>Gestión de eventos</h1>

            {/* Controles */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                <label>Año&nbsp;
                    <select
                        value={filtro.year}
                        onChange={(e) => setFiltro(f => ({ ...f, year: e.target.value }))}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
                <label>Mes&nbsp;
                    <select
                        value={filtro.month}
                        onChange={(e) => setFiltro(f => ({ ...f, month: e.target.value }))}
                    >
                        {months.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                </label>

                <span style={{ alignSelf: 'center', opacity: 0.7 }}>o rango:</span>

                <label>Desde&nbsp;
                    <input
                        type="date"
                        value={filtro.from}
                        onChange={(e) => setFiltro(f => ({ ...f, from: e.target.value }))}
                    />
                </label>
                <label>Hasta&nbsp;
                    <input
                        type="date"
                        value={filtro.to}
                        onChange={(e) => setFiltro(f => ({ ...f, to: e.target.value }))}
                    />
                </label>

                <label>Buscar&nbsp;
                    <input
                        placeholder="Nombre del evento"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <button onClick={cargarEventos} disabled={loading}>
                    {loading ? 'Cargando…' : 'Refrescar'}
                </button>

                <div style={{ marginLeft: 'auto', opacity: 0.7 }}>
                    {eventos.length} evento(s)
                </div>
            </div>

            {msg && (
                <div style={{ background: '#fee', color: '#900', padding: 8, borderRadius: 6, marginBottom: 10 }}>
                    {msg}
                </div>
            )}

            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f6f6f6' }}>
                            <th style={th}>ID</th>
                            <th style={th}>Fecha</th>
                            <th style={th}>Nombre</th>
                            <th style={th}>Descripción</th>
                            <th style={th}>Imagen</th>
                            <th style={th}>Enlace</th>
                            <th style={thCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.map(ev => (
                            <tr key={ev.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={td}>{ev.id}</td>

                                <td style={td}>
                                    {editId === ev.id ? (
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={form.fecha}
                                            onChange={onEditChange}
                                        />
                                    ) : (ev.fecha)}
                                </td>

                                <td style={td}>
                                    {editId === ev.id ? (
                                        <input
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={onEditChange}
                                        />
                                    ) : (ev.nombre)}
                                </td>

                                <td style={{ ...td, maxWidth: 320 }}>
                                    {editId === ev.id ? (
                                        <textarea
                                            name="descripcion"
                                            rows={3}
                                            value={form.descripcion}
                                            onChange={onEditChange}
                                        />
                                    ) : (
                                        <div style={{ opacity: 0.85, fontSize: 13 }}>
                                            {(ev.descripcion || '').length > 140
                                                ? (ev.descripcion || '').slice(0, 140) + '…'
                                                : (ev.descripcion || <span style={{ opacity: 0.6 }}>—</span>)
                                            }
                                        </div>
                                    )}
                                </td>

                                <td style={td}>
                                    {editId === ev.id ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <input
                                                name="imagenUrl"
                                                placeholder="https://..."
                                                value={form.imagenUrl}
                                                onChange={onEditChange}
                                                style={{ minWidth: 220 }}
                                            />
                                            <label style={{ fontSize: 12, opacity: 0.85 }}>
                                                Subir
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => uploadImagen(e.target.files?.[0])}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        ev.imagenUrl
                                            ? <a href={ev.imagenUrl} target="_blank" rel="noreferrer">Abrir</a>
                                            : <span style={{ opacity: 0.6 }}>—</span>
                                    )}
                                </td>

                                <td style={td}>
                                    {editId === ev.id ? (
                                        <input
                                            name="linkUrl"
                                            placeholder="https://..."
                                            value={form.linkUrl}
                                            onChange={onEditChange}
                                        />
                                    ) : (
                                        ev.linkUrl
                                            ? <a href={ev.linkUrl} target="_blank" rel="noreferrer">Abrir</a>
                                            : <span style={{ opacity: 0.6 }}>—</span>
                                    )}
                                </td>

                                <td style={tdCenter}>
                                    {editId === ev.id ? (
                                        <>
                                            <button onClick={saveEdit} style={{ marginRight: 6 }}>💾 Guardar</button>
                                            <button onClick={cancelEdit}>✖ Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => openEdit(ev)} style={{ marginRight: 6 }}>✏️ Editar</button>
                                            <button onClick={() => removeEvento(ev.id)}>🗑 Eliminar</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {!loading && !eventos.length && (
                            <tr>
                                <td colSpan={7} style={{ padding: 16, opacity: 0.7 }}>
                                    No hay eventos que cumplan los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// estilos de tabla (idénticos al de Gestión de clases para coherencia)
const th = { textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' };
const thCenter = { ...th, textAlign: 'center' };
const td = { padding: 8, verticalAlign: 'middle' };
const tdCenter = { ...td, textAlign: 'center', whiteSpace: 'nowrap' };
