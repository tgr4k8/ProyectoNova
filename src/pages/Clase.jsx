// client/src/pages/ClaseDetalle.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import VimeoDualPlayer from '../components/VimeoDualPlayer';
import { API, BASE } from '../config';
// (Opcional pero recomendado) importa tu hoja con las clases .clase-portada y .clase-video
import './Clase.css';

const authHeader = () => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

export default function ClaseDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clase, setClase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

    const [rel, setRel] = useState([]);                // relacionadas (mismo grupo+estilo)
    const [doneSet, setDoneSet] = useState(new Set()); // ids completadas por el usuario

    const puntos = useMemo(() => Number(clase?.novanitos ?? clase?.puntos ?? 0), [clase]);

    // carga clase
    useEffect(() => {
        (async () => {
            setLoading(true); setErr(''); setMsg('');
            try {
                const { data } = await axios.get(`/api/clases/${id}`, { headers: { ...authHeader() } });
                setClase(data);
            } catch (e) {
                setErr(e?.response?.data?.error || 'No se pudo cargar la clase');
            } finally { setLoading(false); }
        })();
    }, [id]);

    // estado de completada
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`/api/clases/${id}/estado`, { headers: { ...authHeader() } });
                setDone(!!data?.completada);
            } catch { setDone(false); }
        })();
    }, [id]);

    // relacionadas + completadas
    useEffect(() => {
        (async () => {
            if (!clase?.grupoId || !clase?.estiloId) return;
            try {
                const [relRes, doneRes] = await Promise.all([
                    axios.get(`/api/clases/relacionadas`, {
                        params: { grupoId: clase.grupoId, estiloId: clase.estiloId, limit: 1000 },
                        headers: { ...authHeader() },
                    }),
                    axios.get(`/api/clases/completadas/mias`, { headers: { ...authHeader() } }),
                ]);
                const relList = Array.isArray(relRes.data) ? relRes.data : (relRes.data.items || []);
                const ordered = relList.sort((a, b) => (a.id - b.id));
                setRel(ordered);
                const doneIds = new Set((doneRes.data || []).map(r => r.claseId));
                setDoneSet(doneIds);
            } catch { }
        })();
    }, [clase?.grupoId, clase?.estiloId]);

    const portada = useMemo(() => {
        const p = clase?.imagenPortada || clase?.portadaUrl || '';
        return p ? (p.startsWith('http') ? p : `${BASE}${p}`) : '';
    }, [clase]);

    const nextId = useMemo(() => {
        if (!rel.length) return null;
        const idx = rel.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return rel[0]?.id ?? null;
        return rel[idx + 1]?.id ?? null;
    }, [rel, id]);

    async function finalizarClase() {
        setBusy(true); setMsg(''); setErr('');
        try {
            const { data } = await axios.post(`/api/clases/${id}/completar`, {}, { headers: { ...authHeader() } });

            // 1) Estado local inmediato
            setDone(true);
            setDoneSet(prev => {
                const ns = new Set(prev);
                ns.add(Number(id));
                return ns;
            });
            setMsg(data?.mensaje || `¡Clase completada! +${puntos} novanitos`);

            // 2) Refresco defensivo tras persistir
            try {
                const [{ data: st }, { data: mine }] = await Promise.all([
                    axios.get(`/api/clases/${id}/estado`, { headers: { ...authHeader() } }),
                    axios.get(`/api/clases/completadas/mias`, { headers: { ...authHeader() } }),
                ]);
                setDone(!!st?.completada);
                const ids = new Set((mine || []).map(r => Number(r.claseId)));
                setDoneSet(ids);
            } catch { }
        } catch (e) {
            setErr(e?.response?.data?.error || 'No se pudo completar la clase');
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <div className="p-4">Cargando…</div>;
    if (err) return <div className="p-4" style={{ color: 'crimson' }}>{err}</div>;
    if (!clase) return null;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-extrabold mb-1">{clase.nombre}</h1>
            {!!clase.descripcion && <p className="text-slate-600 mb-3">{clase.descripcion}</p>}

            {portada && (
                <img
                    src={portada}
                    alt="portada"
                    className="clase-portada"
                />
            )}

            {/* Reproductor (tu componente) */}
            <div className="clase-video">
                <VimeoDualPlayer
                    frontUrl={clase.video1Url || clase.video1 || clase.vimeo1}
                    backUrl={clase.video2Url || clase.video2 || clase.vimeo2}
                />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 mt-3">
                {!done && (
                    <button
                        className="btn btn-alert"
                        onClick={finalizarClase}
                        disabled={busy}
                        style={{
                            fontWeight: 800, borderRadius: 10, padding: '10px 14px',
                        }}
                    >
                        {`Finalizar clase (+${fmt(puntos)} novanitos)`}
                    </button>
                )}
                {done && (
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Clase completada ✓</span>
                )}

                {nextId && (
                    <button
                        className="btn"
                        onClick={() => navigate(`/clases/${nextId}`)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 14px', fontWeight: 800 }}
                    >
                        Siguiente clase →
                    </button>
                )}

                {msg && <span style={{ color: '#16a34a' }}>{msg}</span>}
                {err && <span style={{ color: 'crimson' }}>{err}</span>}
            </div>

            {/* Relacionadas */}
            <div className="mt-6">
                <h2 className="text-xl font-extrabold mb-2">Más clases de este estilo y grupo</h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 12,
                    }}
                >
                    {rel.map((c) => {
                        const cover = c.imagenPortada || c.portadaUrl || '';
                        const src = cover ? (cover.startsWith('http') ? cover : `${BASE}${cover}`) : '';
                        const doneThis = doneSet.has(Number(c.id));
                        return (
                            <Link
                                key={c.id}
                                to={`/clases/${c.id}`}
                                style={{
                                    display: 'block',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0f172a' }}>
                                    {src ? (
                                        <img src={src} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : null}
                                    {doneThis && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                background: '#16a34a',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 800,
                                            }}
                                        >
                                            ✓ Completada
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '8px 10px' }}>
                                    <div style={{ fontWeight: 800 }}>{c.nombre}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
