// client/src/pages/Usuario.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NovanitosBonos from '../components/NovanitosBonos';
import { assetUrl } from '../utils/assets';
import './Usuario.css';



export default function Usuario() {
    const [perfil, setPerfil] = useState(null);
    const [accordion, setAccordion] = useState({ clases: true, recomendadas: false, eventos: false });

    // subida/preview de foto
    const [fotoLocal, setFotoLocal] = useState('');
    const [subiendo, setSubiendo] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const authHeader = () => {
        const t = localStorage.getItem('token');
        return t ? { Authorization: `Bearer ${t}` } : {};
    };

    // Helper: formateo seguro de fechas
    function fmtDate(d) {
        if (!d) return null;
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return null;
            return dt.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch {
            return null;
        }
    }

    // Lee posibles nombres para inicio/fin de suscripción
    function pickSubscription(obj = {}) {
        const rawStart =
            obj.suscripcionInicio ||
            obj.subscriptionStart ||
            obj.fechaInicioSuscripcion ||
            obj.subStart ||
            null;

        const rawEnd =
            obj.suscripcionFin ||
            obj.subscriptionEnd ||
            obj.fechaFinSuscripcion ||
            obj.subEnd ||
            null;

        return {
            startRaw: rawStart,
            endRaw: rawEnd,
            start: fmtDate(rawStart),
            end: fmtDate(rawEnd),
            hasAny: !!(rawStart || rawEnd),
        };
    }

    async function loadPerfil() {
        setErr(''); setMsg('');
        try {
            let base = null;
            try {
                const { data } = await axios.get(`/api/usuarios/me`, { headers: { ...authHeader() } });
                base = data;
            } catch {
                const { data } = await axios.get(`/api/auth/perfil`, { headers: { ...authHeader() } });
                base = data;
            }

            const nombreNorm = base?.nombre ?? base?.name ?? base?.Nombre ?? '';
            const apellidoNorm = base?.apellido ?? base?.apellidos ?? base?.lastName ?? base?.Apellido ?? '';
            const sub = pickSubscription(base);

            const norm = {
                id: base?.id,
                email: base?.email || '',
                nombre: nombreNorm,
                apellido: apellidoNorm,
                tipo: base?.tipo || '',
                puntos: base?.puntos ?? base?.score ?? 0,
                fotoPerfilUrl: base?.fotoPerfilUrl || '',
                emailVerified: !!base?.emailVerified,
                suscripcionInicio: sub.startRaw || null,
                suscripcionFin: sub.endRaw || null,
                _subFmt: { start: sub.start, end: sub.end, hasAny: sub.hasAny },
            };

            setPerfil(norm);
            setFotoLocal('');
        } catch {
            setPerfil(null);
            setErr('No se pudo cargar tu perfil');
        }
    }

    useEffect(() => { loadPerfil(); /* eslint-disable-next-line */ }, []);

    function toggleAccordion(section) {
        setAccordion(prev => ({ ...prev, [section]: !prev[section] }));
    }

    // Subida de foto
    async function onFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setMsg(''); setErr(''); setSubiendo(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);

            let data;
            try {
                const r1 = await axios.post(`/api/usuarios/upload-foto`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
                });
                data = r1.data;
            } catch {
                const r2 = await axios.post(`/api/usuarios/upload-imagen`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
                });
                data = r2.data;
            }

            const relative = data?.relativeUrl || data?.path || data?.url || '';
            const absolute = data?.absoluteUrl || '';
            if (!relative && !absolute) throw new Error('Sin URL devuelta');

            const finalUrl = relative || absolute;
            setFotoLocal(finalUrl);
            setMsg('Imagen subida. Pulsa “Guardar foto”.');
        } catch (e2) {
            setErr(e2?.response?.data?.error || 'No se pudo subir la imagen');
        } finally {
            setSubiendo(false);
        }
    }

    async function guardarFoto() {
        if (!fotoLocal) return;
        setMsg(''); setErr('');
        try {
            const body = { fotoPerfilUrl: fotoLocal };
            try {
                await axios.patch(`/api/usuarios/me/foto`, body, {
                    headers: { 'Content-Type': 'application/json', ...authHeader() }
                });
            } catch {
                await axios.patch(`/api/usuarios/me`, body, {
                    headers: { 'Content-Type': 'application/json', ...authHeader() }
                });
            }
            setMsg('✅ Foto de perfil actualizada.');
            await loadPerfil();
        } catch (e2) {
            setErr(e2?.response?.data?.error || 'No se pudo guardar la foto');
        }
    }

    const displayName = (() => {
        if (!perfil) return 'Usuario';
        const prefer = (perfil.nombre || '').trim() || '';
        const ap = (perfil.apellido || '').trim() || '';
        const full = [prefer, ap].filter(Boolean).join(' ').trim();
        if (full) return full;
        if (prefer) return prefer;
        if (perfil.email) return perfil.email.split('@')[0];
        return 'Usuario';
    })();

    const fotoActual = assetUrl(fotoLocal || perfil?.fotoPerfilUrl || '/imagenes/profesor.jpg');
    const tipoLabel = (perfil?.tipo || '').charAt(0).toUpperCase() + (perfil?.tipo || '').slice(1);
    const subStart = perfil?._subFmt?.start || null;
    const subEnd = perfil?._subFmt?.end || null;
    const hasSubscription = !!perfil?._subFmt?.hasAny;

    return (
        <div className="usuario-page">
            <h1 className="usuario-title">Usuario: {displayName}</h1>

            {/* Cabecera de perfil */}
            <div className="perfil-card">
                <div className="perfil-left">
                    <div className="perfil-avatar">
                        <img src={fotoActual} alt="Foto de usuario" />
                    </div>
                    <div className="perfil-identity">
                        <div className="perfil-name">{displayName}</div>

                        {/* Email */}
                        <div className="perfil-email">
                            {perfil?.email || '—'}
                            {typeof perfil?.emailVerified === 'boolean' && (
                                <span className={`verify-badge ${perfil.emailVerified ? 'ok' : 'no'}`}>
                                    {perfil.emailVerified ? 'Verificado' : 'No verificado'}
                                </span>
                            )}
                        </div>

                        {/* Rol y puntos */}
                        <div className="perfil-meta">
                            {perfil?.tipo && <span className="chip role">{tipoLabel}</span>}
                            <span className="chip points">Puntos: {perfil?.puntos ?? 0}</span>
                        </div>

                        {/* Suscripción */}
                        <div className="perfil-sub">
                            <div className="sub-head">Suscripción</div>
                            {hasSubscription ? (
                                <div className="sub-dates">
                                    <span>Inicio: <b>{subStart || '—'}</b></span>
                                    <span>Fin: <b>{subEnd || '—'}</b></span>
                                </div>
                            ) : (
                                <div className="chip sub-none">Sin suscripción</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="perfil-right">
                    <label className="upload-label">
                        <span className="btn-yellow">Cambiar foto</span>
                        <input type="file" accept="image/*" onChange={onFileChange} disabled={subiendo} />
                    </label>
                    <button
                        onClick={guardarFoto}
                        disabled={!fotoLocal || subiendo}
                        className="btn-yellow outline"
                    >
                        Guardar foto
                    </button>

                    {subiendo && <div className="hint">Subiendo…</div>}
                    {msg && <div className="ok">{msg}</div>}
                    {err && <div className="error">{err}</div>}
                </div>
            </div>

            {/* ======= NOVANITOS a pantalla completa con fondo azul oscuro ======= */}
            <div className="panel panel-full panel-dark">
                <NovanitosBonos />
            </div>

            {/* Secciones colapsables */}
            <div className="panel">
                <div className="panel-head">
                    <h2>Tus últimas clases</h2>
                    <button className="link" onClick={() => toggleAccordion('clases')}>
                        {accordion.clases ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                {!accordion.clases && <div className="muted">Sección oculta</div>}
            </div>
        </div>
    );
}
