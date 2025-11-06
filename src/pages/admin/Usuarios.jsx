// client/src/pages/admin/UsuariosAdmin.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import './AdminForms.css';


const ROLES = ['invitado', 'subscrito', 'profesor', 'administrador'];

export default function UsuariosAdmin() {
    const token = localStorage.getItem('token');

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    // filtros y paginación
    const [tipo, setTipo] = useState('');
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(50);
    const [offset, setOffset] = useState(0);

    // mensajes
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    // edición local por usuario
    // { [id]: { puntos, novanitos, tipo, fecha_inicio, fecha_fin, password_tmp } }
    const [edits, setEdits] = useState({});

    const headers = useMemo(
        () => (token ? { Authorization: `Bearer ${token}` } : {}),
        [token]
    );

    const cargar = useCallback(async () => {
        setLoading(true);
        setMsg(null);
        setErr(null);
        try {
            const params = { limit, offset };
            if (tipo) params.tipo = tipo;
            if (search) params.search = search;

            const { data } = await axios.get(`/api/usuarios`, { params, headers });
            setItems(data.items || []);
            setTotal(data.total || 0);
            // al recargar, mantenemos los edits existentes (no los borramos)
        } catch (e) {
            setErr(e.response?.data?.error || 'Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    }, [limit, offset, tipo, search, headers]);

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipo, limit, offset]);

    const onBuscar = (e) => {
        e.preventDefault();
        setOffset(0);
        cargar();
    };

    // helpers de edición
    const getVal = (u, field, fallback) =>
        edits[u.id]?.[field] ?? (u[field] ?? fallback);

    const setEdit = (id, patch) =>
        setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

    const clearEdit = (id) =>
        setEdits((prev) => {
            const { [id]: _removed, ...rest } = prev;
            return rest;
        });

    // guardar cambios del usuario (solo los campos presentes en edits[id])
    const guardarFila = async (id) => {
        setMsg(null);
        setErr(null);
        const patch = { ...(edits[id] || {}) };

        // Normaliza puntos/novanitos
        if (patch.puntos != null) {
            const n = Number(patch.puntos);
            patch.puntos = Number.isFinite(n) ? n : 0;
            // mantén ambos para compatibilidad backend
            patch.novanitos = patch.puntos;
        }

        // Si venía password_tmp de la UI, lo mandamos como reset-password
        const { password_tmp, ...restPatch } = patch;

        try {
            // 1) si hay password_tmp -> endpoint de reset
            if (password_tmp && password_tmp.length >= 6) {
                await axios.patch(
                    `/api/usuarios/${id}/reset-password`,
                    { password: password_tmp },
                    { headers }
                );
            }

            // 2) el resto de campos al endpoint general solo si hay algo que mandar
            const toSend = Object.fromEntries(
                Object.entries(restPatch).filter(([, v]) => v !== undefined)
            );

            // evita PATCH vacío
            if (Object.keys(toSend).length > 0) {
                const { data } = await axios.patch(`/api/usuarios/${id}`, toSend, {
                    headers,
                });
                // actualiza la fila en memoria con lo devuelto
                setItems((prev) => prev.map((u) => (u.id === id ? data : u)));
            }

            setMsg('✅ Cambios guardados');
            clearEdit(id);
        } catch (e) {
            setErr(e.response?.data?.error || 'Error guardando cambios');
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
        try {
            await axios.delete(`/api/usuarios/${id}`, { headers });
            setItems((prev) => prev.filter((u) => u.id !== id));
            setTotal((t) => Math.max(0, t - 1));
            setMsg('✅ Usuario eliminado');
            clearEdit(id);
        } catch (e) {
            setErr(e.response?.data?.error || 'Error eliminando usuario');
        }
    };

    const fmtDateLocal = (val) => {
        try {
            if (!val) return '';
            const d = new Date(val);
            // datetime-local espera "YYYY-MM-DDTHH:MM"
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
        } catch {
            return '';
        }
    };

    return (
        <div className="admin-forms">
            <h1>Gestión de Usuarios</h1>

            <form
                onSubmit={onBuscar}
                style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}
            >
                <label>Rol</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ minWidth: 160 }}>
                    <option value="">Todos</option>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>

                <input
                    placeholder="Buscar por nombre, apellido o email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit">Buscar</button>

                <label>Límite</label>
                <input
                    type="number"
                    min={1}
                    max={200}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value) || 50)}
                    style={{ width: 80 }}
                />
            </form>

            {loading && <p>Cargando…</p>}
            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {err && <p style={{ color: 'crimson' }}>{err}</p>}

            <p>Total: {total}</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Rol</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Puntos</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Inicio subscr.</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fin subscr.</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Reset pass</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((u) => {
                            const puntosFallback = u.puntos ?? u.novanitos ?? 0;
                            const rowEdited = !!edits[u.id];

                            return (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>
                                        {u.nombre} {u.apellido || ''}
                                    </td>
                                    <td>{u.email}</td>

                                    {/* Rol (no guarda hasta pulsar Guardar cambios) */}
                                    <td>
                                        <select
                                            value={getVal(u, 'tipo', u.tipo)}
                                            onChange={(e) => setEdit(u.id, { tipo: e.target.value })}
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Puntos (edición local) */}
                                    <td>
                                        <input
                                            type="number"
                                            value={getVal(u, 'puntos', puntosFallback)}
                                            onChange={(e) => setEdit(u.id, { puntos: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') guardarFila(u.id);
                                            }}
                                            style={{ width: 90 }}
                                        />
                                    </td>

                                    {/* Fechas (edición local; guarda al pulsar Guardar) */}
                                    <td>
                                        <input
                                            type="datetime-local"
                                            value={fmtDateLocal(getVal(u, 'fecha_inicio', u.fecha_inicio))}
                                            onChange={(e) =>
                                                setEdit(u.id, {
                                                    fecha_inicio: e.target.value
                                                        ? new Date(e.target.value).toISOString()
                                                        : null,
                                                })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="datetime-local"
                                            value={fmtDateLocal(getVal(u, 'fecha_fin', u.fecha_fin))}
                                            onChange={(e) =>
                                                setEdit(u.id, {
                                                    fecha_fin: e.target.value
                                                        ? new Date(e.target.value).toISOString()
                                                        : null,
                                                })
                                            }
                                        />
                                    </td>

                                    {/* Reset pass (se envía al pulsar Guardar cambios) */}
                                    <td>
                                        <input
                                            type="password"
                                            placeholder="Nueva contraseña"
                                            value={getVal(u, 'password_tmp', '')}
                                            onChange={(e) => setEdit(u.id, { password_tmp: e.target.value })}
                                            style={{ width: 150 }}
                                        />
                                    </td>

                                    {/* Acciones */}
                                    <td style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => guardarFila(u.id)}
                                            disabled={!rowEdited}
                                            style={{
                                                background: rowEdited ? '#2563eb' : '#9ca3af',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '6px 10px',
                                                cursor: rowEdited ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Guardar cambios
                                        </button>
                                        <button
                                            style={{
                                                background: 'crimson',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => eliminar(u.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!items.length && !loading && (
                            <tr>
                                <td colSpan={9}>Sin resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación simple */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
                    Anterior
                </button>
                <span>
                    Página {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}
                </span>
                <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
                    Siguiente
                </button>
            </div>
        </div>
    );
}
