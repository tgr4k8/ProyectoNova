// client/src/pages/admin/LimboClases.jsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { assetUrl } from '../../utils/assets';
import './AdminForms.css';

export default function LimboClases() {
    const [propuestas, setPropuestas] = useState([]);
    const [filtro, setFiltro] = useState('todas');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const loadPropuestas = useCallback(async () => {
        setCargando(true);
        setMsg(''); setError('');
        try {
            // ✅ usa el cliente api (baseURL /api) y ruta absoluta del recurso
            const { data } = await api.get('/propuestas');
            setPropuestas(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.response?.data?.error || 'No se pudieron cargar las propuestas');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { loadPropuestas(); }, [loadPropuestas]);

    async function aprobar(id) {
        setMsg(''); setError('');
        try {
            await api.post(`/propuestas/${id}/aprobar`);
            setMsg('Propuesta aprobada y convertida en clase.');
            await loadPropuestas();
        } catch (e) {
            setError(e?.response?.data?.error || 'Error al aprobar la propuesta');
        }
    }

    async function rechazar(id) {
        if (!window.confirm('¿Seguro que quieres rechazar y eliminar esta propuesta?')) return;
        setMsg(''); setError('');
        try {
            await api.delete(`/propuestas/${id}`);
            setMsg('Propuesta rechazada/eliminada.');
            await loadPropuestas();
        } catch (e) {
            setError(e?.response?.data?.error || 'Error al rechazar/eliminar la propuesta');
        }
    }

    const pick = (...vals) => {
        for (const v of vals) {
            if (v && String(v).trim() !== '') return String(v).trim();
        }
        return '';
    };

    return (
        <div className="admin-forms">
            <h1 className="text-2xl font-semibold mb-4">Propuestas de clases</h1>

            <div className="mb-3 flex gap-2 items-center">
                <label>Filtro:</label>
                <select value={filtro} onChange={e => setFiltro(e.target.value)}>
                    <option value="todas">Todas</option>
                    <option value="pendiente">Pendientes</option>
                </select>
                <button className="btn" onClick={loadPropuestas} disabled={cargando}>Recargar</button>
            </div>

            {msg && <div className="p-2 bg-green-100 border border-green-300 rounded mb-3">{msg}</div>}
            {error && <div className="p-2 bg-red-100 border border-red-300 rounded mb-3">{error}</div>}

            {cargando ? (
                <div>Cargando…</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {propuestas
                        .filter(p => filtro === 'todas' ? true : (p.estado ? p.estado === 'pendiente' : true))
                        .map(p => {
                            const portada = pick(p.imagenPortada, p.portadaUrl, p.coverUrl, p.cover, p.imagen);
                            const v1 = pick(p.video1Url, p.video1, p.vimeo1);
                            const v2 = pick(p.video2Url, p.video2, p.vimeo2);
                            return (
                                <div key={p.id} className="border rounded p-3">
                                    <div className="text-sm opacity-70 mb-1">Identificación {p.id}</div>
                                    <div className="font-semibold">{p.nombre || 'Sin título'}</div>
                                    <div className="text-sm opacity-80 mb-2">{p.descripcion || 'Sin descripción'}</div>

                                    {portada && (
                                        <img
                                            // ✅ normaliza /uploads/... o deja absolutas
                                            src={assetUrl(portada)}
                                            alt="portada"
                                            className="w-full max-h-44 object-cover rounded mb-2"
                                        />
                                    )}

                                    <div className="text-xs opacity-70 mb-2">
                                        Grupo: {p.grupoId ?? '—'} · Estilo: {p.estiloId ?? '—'} · Profesor: {p.profesorId ?? '—'}
                                    </div>

                                    <div className="text-xs mb-2">
                                        <div>Vídeo 1: <span className="opacity-70">{v1 || '—'}</span></div>
                                        <div>Vídeo 2: <span className="opacity-70">{v2 || '—'}</span></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="btn" onClick={() => aprobar(p.id)}>Aprobar</button>
                                        <button className="btn btn-danger" onClick={() => rechazar(p.id)}>Rechazar</button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
