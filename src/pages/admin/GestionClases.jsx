// client/src/pages/admin/GestionClases.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminForms.css';


export default function GestionClases() {
    const [grupos, setGrupos] = useState([]);
    const [estilos, setEstilos] = useState([]);
    const [filtro, setFiltro] = useState({ grupoId: '', estiloId: '' });
    const [search, setSearch] = useState('');
    const [clases, setClases] = useState([]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editEstilos, setEditEstilos] = useState([]);
    const [form, setForm] = useState({
        nombre: '', clave: '',
        grupoId: '', estiloId: '',
        video1Url: '', video2Url: '',
        portadaUrl: '', descripcion: '',
        puntos: 0
    });

    const authHeader = () => {
        const t = localStorage.getItem('token'); return t ? { Authorization: `Bearer ${t}` } : {};
    };

    useEffect(() => { axios.get(`/api/grupos`, { headers: { ...authHeader() } }).then(r => setGrupos(r.data || [])); }, []);

    useEffect(() => {
        if (!filtro.grupoId) { setEstilos([]); setFiltro(f => ({ ...f, estiloId: '' })); return; }
        axios.get(`/api/estilos`, { params: { grupoId: Number(filtro.grupoId) }, headers: { ...authHeader() } })
            .then(r => setEstilos(r.data || [])).catch(() => setEstilos([]));
    }, [filtro.grupoId]);

    async function cargarClases() {
        try {
            setLoading(true);
            const params = {};
            if (filtro.grupoId) params.grupoId = Number(filtro.grupoId);
            if (filtro.estiloId) params.estiloId = Number(filtro.estiloId);
            const { data } = await axios.get(`/api/clases`, { params, headers: { ...authHeader() } });
            const arr = Array.isArray(data) ? data : [];
            const filtrado = search.trim() ? arr.filter(c => (c.nombre || '').toLowerCase().includes(search.trim().toLowerCase())) : arr;
            setClases(filtrado); setMsg('');
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Error cargando clases.'); setClases([]);
        } finally { setLoading(false); }
    }
    useEffect(() => { cargarClases(); }, []);
    useEffect(() => { cargarClases(); }, [filtro.grupoId, filtro.estiloId, search]);

    async function openEdit(c) {
        setEditId(c.id);
        setForm({
            nombre: c.nombre || '',
            clave: c.clave || '',
            grupoId: String(c.grupoId || ''),
            estiloId: String(c.estiloId || ''),
            video1Url: c.video1Url || '',
            video2Url: c.video2Url || '',
            portadaUrl: c.portadaUrl || '',
            descripcion: c.descripcion || '',
            puntos: Number(c.puntos || 0),
        });
        if (c.grupoId) {
            try {
                const { data } = await axios.get(`/api/estilos`, { params: { grupoId: Number(c.grupoId) }, headers: { ...authHeader() } });
                setEditEstilos(Array.isArray(data) ? data : []);
            } catch { setEditEstilos([]); }
        } else setEditEstilos([]);
    }
    function cancelEdit() { setEditId(null); setEditEstilos([]); }
    async function onEditChange(e) { const { name, value } = e.target; setForm(f => ({ ...f, [name]: name === 'puntos' ? Number(value) : value })); if (name === 'grupoId') { const { data } = await axios.get(`/api/estilos`, { params: { grupoId: Number(value) }, headers: { ...authHeader() } }); setEditEstilos(data || []); setForm(f => ({ ...f, estiloId: '' })); } }

    async function saveEdit() {
        try {
            const body = {
                nombre: form.nombre,
                clave: form.clave,
                grupoId: form.grupoId ? Number(form.grupoId) : undefined,
                estiloId: form.estiloId ? Number(form.estiloId) : undefined,
                video1Url: form.video1Url || null,
                video2Url: form.video2Url || null,
                portadaUrl: form.portadaUrl || null,
                descripcion: form.descripcion || null,
                puntos: Number.isFinite(Number(form.puntos)) ? Number(form.puntos) : 0
            };
            await axios.patch(`/api/clases/${editId}`, body, { headers: { ...authHeader() } });
            cancelEdit(); await cargarClases();
        } catch (e) { setMsg(e?.response?.data?.error || 'Error actualizando clase.'); }
    }

    async function removeClase(id) {
        if (!window.confirm('¿Seguro que quieres eliminar esta clase?')) return;
        try { await axios.delete(`/api/clases/${id}`, { headers: { ...authHeader() } }); await cargarClases(); }
        catch (e) { setMsg(e?.response?.data?.error || 'Error eliminando clase.'); }
    }

    return (
        <div className="admin-forms">
            <h1>Gestión de clases</h1>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                <label>Grupo&nbsp;
                    <select value={filtro.grupoId} onChange={(e) => setFiltro(f => ({ ...f, grupoId: e.target.value, estiloId: '' }))}>
                        <option value="">Todos</option>
                        {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </select>
                </label>
                <label>Estilo&nbsp;
                    <select value={filtro.estiloId} onChange={(e) => setFiltro(f => ({ ...f, estiloId: e.target.value }))} disabled={!filtro.grupoId}>
                        <option value="">Todos</option>
                        {estilos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </label>
                <label>Buscar&nbsp;<input placeholder="Nombre de la clase" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
                <button onClick={cargarClases} disabled={loading}>{loading ? 'Cargando…' : 'Refrescar'}</button>
                <div style={{ marginLeft: 'auto', opacity: 0.7 }}>{clases.length} clase(s)</div>
            </div>

            {msg && <div style={{ background: '#fee', color: '#900', padding: 8, borderRadius: 6, marginBottom: 10 }}>{msg}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f6f6f6' }}>
                            <th style={th}>ID</th>
                            <th style={th}>Nombre</th>
                            <th style={th}>Clave</th>
                            <th style={th}>Grupo</th>
                            <th style={th}>Estilo</th>
                            <th style={th}>Puntos</th>
                            <th style={th}>Portada</th>
                            <th style={th}>Vídeo 1</th>
                            <th style={th}>Vídeo 2</th>
                            <th style={th}>Descripción</th>
                            <th style={thCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clases.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={td}>{c.id}</td>

                                <td style={td}>{editId === c.id ? <input name="nombre" value={form.nombre} onChange={onEditChange} /> : c.nombre}</td>
                                <td style={td}>{editId === c.id ? <input name="clave" value={form.clave} onChange={onEditChange} /> : c.clave}</td>

                                <td style={td}>
                                    {editId === c.id ? (
                                        <select name="grupoId" value={form.grupoId} onChange={onEditChange}>
                                            <option value="">(selecciona)</option>
                                            {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                        </select>
                                    ) : (c.Grupo?.nombre || c.grupoId)}
                                </td>

                                <td style={td}>
                                    {editId === c.id ? (
                                        <select name="estiloId" value={form.estiloId} onChange={onEditChange} disabled={!form.grupoId}>
                                            <option value="">(selecciona)</option>
                                            {editEstilos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                        </select>
                                    ) : (c.Estilo?.nombre || c.estiloId)}
                                </td>

                                <td style={tdSmall}>{editId === c.id ? <input type="number" name="puntos" value={form.puntos} min="0" onChange={onEditChange} style={{ width: 80 }} /> : (c.puntos ?? 0)}</td>

                                <td style={td}>{editId === c.id ? <input name="portadaUrl" value={form.portadaUrl} onChange={onEditChange} placeholder="https://..." /> : (c.portadaUrl ? <a href={c.portadaUrl} target="_blank" rel="noreferrer">Abrir</a> : <span style={{ opacity: 0.6 }}>—</span>)}</td>

                                <td style={td}>{editId === c.id ? <input name="video1Url" value={form.video1Url} onChange={onEditChange} placeholder="https://..." /> : (c.video1Url ? <a href={c.video1Url} target="_blank" rel="noreferrer">Abrir</a> : <span style={{ opacity: 0.6 }}>—</span>)}</td>

                                <td style={td}>{editId === c.id ? <input name="video2Url" value={form.video2Url} onChange={onEditChange} placeholder="https://..." /> : (c.video2Url ? <a href={c.video2Url} target="_blank" rel="noreferrer">Abrir</a> : <span style={{ opacity: 0.6 }}>—</span>)}</td>

                                <td style={{ ...td, maxWidth: 280 }}>
                                    {editId === c.id ? (
                                        <textarea name="descripcion" value={form.descripcion} onChange={onEditChange} rows={3} />
                                    ) : (
                                        <div style={{ opacity: 0.85, fontSize: 13 }}>
                                            {(c.descripcion || '').length > 120 ? c.descripcion.slice(0, 120) + '…' : (c.descripcion || <span style={{ opacity: 0.6 }}>—</span>)}
                                        </div>
                                    )}
                                </td>

                                <td style={tdCenter}>
                                    {editId === c.id ? (
                                        <>
                                            <button onClick={saveEdit} style={{ marginRight: 6 }}>💾 Guardar</button>
                                            <button onClick={cancelEdit}>✖ Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => openEdit(c)} style={{ marginRight: 6 }}>✏️ Editar</button>
                                            <button onClick={() => removeClase(c.id)}>🗑 Eliminar</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!loading && !clases.length && (
                            <tr><td colSpan={11} style={{ padding: 16, opacity: 0.7 }}>No hay clases que cumplan los filtros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const th = { textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' };
const thCenter = { ...th, textAlign: 'center' };
const td = { padding: 8, verticalAlign: 'middle' };
const tdSmall = { ...td, width: 100, whiteSpace: 'nowrap' };
const tdCenter = { ...td, textAlign: 'center', whiteSpace: 'nowrap' };
