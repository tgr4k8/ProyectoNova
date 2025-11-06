// client/src/components/VimeoSyncedDualPlayer.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API, BASE } from '../config';

/** Carga el script oficial de Vimeo una sola vez */
let vimeoReady;
function loadVimeoAPI() {
    if (vimeoReady) return vimeoReady;
    vimeoReady = new Promise((resolve, reject) => {
        if (window.Vimeo?.Player) return resolve(window.Vimeo.Player);
        const s = document.createElement('script');
        s.src = 'https://player.vimeo.com/api/player.js';
        s.async = true;
        s.onload = () => resolve(window.Vimeo?.Player);
        s.onerror = reject;
        document.head.appendChild(s);
    });
    return vimeoReady;
}

/** Acepta id o url y la normaliza para la API de Vimeo */
function normVimeo(input) {
    if (!input) return '';
    const u = String(input).trim();
    const m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return `https://vimeo.com/${m[1]}`;
    if (/^\d+$/.test(u)) return `https://vimeo.com/${u}`;
    return u;
}

/** Construye src embed con params útiles */
function buildEmbedSrc(url) {
    const base = url.replace('https://vimeo.com/', 'https://player.vimeo.com/video/');
    const params = new URLSearchParams({
        autoplay: '0',
        autopause: '0',
        controls: '1',
        muted: '1',
        playsinline: '1',
        dnt: '1',
        title: '0',
        byline: '0',
        portrait: '0',
        transparent: '0',
    }).toString();
    return `${base}?${params}`;
}

export default function VimeoSyncedDualPlayer({
    frontUrl,          // vídeo delantera (url o id)
    backUrl,           // vídeo trasera  (url o id)
    className = '',
    style = {},        // ✅ ahora puedes pasar style desde fuera (ancho, maxWidth, etc.)
}) {
    const [active, setActive] = useState('front'); // 'front' | 'back'
    const [fs, setFs] = useState(false);
    const [errors, setErrors] = useState({ front: null, back: null });

    const wrapRef = useRef(null);
    const iFront = useRef(null);
    const iBack = useRef(null);
    const pFront = useRef(null);
    const pBack = useRef(null);

    const frontN = useMemo(() => normVimeo(frontUrl), [frontUrl]);
    const backN = useMemo(() => normVimeo(backUrl), [backUrl]);
    const frontSrc = useMemo(() => (frontN ? buildEmbedSrc(frontN) : ''), [frontN]);
    const backSrc = useMemo(() => (backN ? buildEmbedSrc(backN) : ''), [backN]);

    const hasFront = !!frontSrc;
    const hasBack = !!backSrc;

    // Crea players (controlamos ambos iframes con la API de Vimeo)
    useEffect(() => {
        let disposed = false;
        (async () => {
            await loadVimeoAPI();
            if (disposed) return;

            try { await pFront.current?.destroy?.(); } catch { }
            try { await pBack.current?.destroy?.(); } catch { }
            setErrors({ front: null, back: null });

            if (hasFront && iFront.current) {
                pFront.current = new window.Vimeo.Player(iFront.current);
                pFront.current.setMuted(active !== 'front').catch(() => { });
                pFront.current.setVolume(active === 'front' ? 1 : 0).catch(() => { });
                pFront.current.on('error', (e) => setErrors(prev => ({ ...prev, front: e?.message || 'Vídeo no encontrado' })));
                pFront.current.on('timeupdate', onTimeFront);
                pFront.current.on('seeked', onSeekFront);
                pFront.current.on('play', onPlayBoth);
                pFront.current.on('pause', onPauseBoth);
            }

            if (hasBack && iBack.current) {
                pBack.current = new window.Vimeo.Player(iBack.current);
                pBack.current.setMuted(active !== 'back').catch(() => { });
                pBack.current.setVolume(active === 'back' ? 1 : 0).catch(() => { });
                pBack.current.on('error', (e) => setErrors(prev => ({ ...prev, back: e?.message || 'Vídeo no encontrado' })));
                pBack.current.on('timeupdate', onTimeBack);
                pBack.current.on('seeked', onSeekBack);
                pBack.current.on('play', onPlayBoth);
                pBack.current.on('pause', onPauseBoth);
            }
        })();

        return () => { disposed = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frontSrc, backSrc]);

    // Sincronización
    const syncing = useRef(false);
    const lastTick = useRef(0);
    const lastTime = useRef(0);
    const DRIFT = 0.15;      // segundos tolerados
    const THROTTLE = 180;    // ms

    async function syncFollower(master, follower) {
        try {
            const [mt, ft] = await Promise.all([master?.getCurrentTime?.(), follower?.getCurrentTime?.()]);
            if (typeof mt !== 'number' || typeof ft !== 'number') return;
            lastTime.current = mt;
            if (Math.abs(mt - ft) > DRIFT) {
                syncing.current = true;
                await follower.setCurrentTime(mt);
            }
        } catch { } finally { syncing.current = false; }
    }

    function onPlayBoth() {
        if (syncing.current) return;
        syncing.current = true;
        Promise.all([pFront.current?.play?.(), pBack.current?.play?.()]).finally(() => (syncing.current = false));
    }
    function onPauseBoth() {
        if (syncing.current) return;
        syncing.current = true;
        Promise.all([pFront.current?.pause?.(), pBack.current?.pause?.()]).finally(() => (syncing.current = false));
    }
    const onSeekFront = () => { if (!syncing.current && pBack.current) syncFollower(pFront.current, pBack.current); };
    const onSeekBack = () => { if (!syncing.current && pFront.current) syncFollower(pBack.current, pFront.current); };

    const onTimeFront = async () => {
        const now = Date.now();
        if (now - lastTick.current < THROTTLE) return;
        lastTick.current = now;
        if (syncing.current || active !== 'front' || !pBack.current) return;
        await syncFollower(pFront.current, pBack.current);
    };
    const onTimeBack = async () => {
        const now = Date.now();
        if (now - lastTick.current < THROTTLE) return;
        lastTick.current = now;
        if (syncing.current || active !== 'back' || !pFront.current) return;
        await syncFollower(pBack.current, pFront.current);
    };

    // Cambio de vista: pausa ambos, iguala tiempos, mute/volumen y reproduce el activo
    useEffect(() => {
        (async () => {
            const A = pFront.current;
            const B = pBack.current;
            if (!A && !B) return;

            try {
                syncing.current = true;
                await Promise.all([A?.pause?.(), B?.pause?.()]);
            } catch { } finally { syncing.current = false; }

            try {
                if (active === 'front') {
                    const t = typeof lastTime.current === 'number' ? lastTime.current : await A?.getCurrentTime?.();
                    if (typeof t === 'number') await Promise.all([A?.setCurrentTime?.(t), B?.setCurrentTime?.(t)]);
                    await Promise.all([A?.setMuted?.(false), A?.setVolume?.(1), B?.setMuted?.(true), B?.setVolume?.(0)]);
                    await A?.play?.();
                } else {
                    const t = typeof lastTime.current === 'number' ? lastTime.current : await B?.getCurrentTime?.();
                    if (typeof t === 'number') await Promise.all([A?.setCurrentTime?.(t), B?.setCurrentTime?.(t)]);
                    await Promise.all([B?.setMuted?.(false), B?.setVolume?.(1), A?.setMuted?.(true), A?.setVolume?.(0)]);
                    await B?.play?.();
                }
            } catch { }
        })();
    }, [active]);

    // Fullscreen label
    useEffect(() => {
        const onFs = () => setFs(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFs);
        return () => document.removeEventListener('fullscreenchange', onFs);
    }, []);
    const toggleFullscreen = async () => {
        try {
            const el = wrapRef.current;
            if (!document.fullscreenElement) await el?.requestFullscreen?.();
            else await document.exitFullscreen();
        } catch { }
    };

    const Btn = ({ onClick, children, active = false }) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: active ? '2px solid #2563eb' : '1px solid rgba(0,0,0,.15)',
                background: active ? '#e0e7ff' : '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,.15)',
            }}
        >
            {children}
        </button>
    );

    return (
        <div className={className} style={style}>
            {/* Ratio box 16:9 SIN ResizeObserver */}
            <div
                ref={wrapRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    background: '#000',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}
            >
                {/* Sizer para altura 16:9 */}
                <div aria-hidden style={{ paddingTop: '56.25%' }} />

                {/* Iframe FRONT (absoluto, ocupa todo) */}
                {hasFront && (
                    <iframe
                        ref={iFront}
                        src={frontSrc}
                        title="Vimeo front"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0,
                            zIndex: active === 'front' ? 2 : 1,
                            pointerEvents: active === 'front' ? 'auto' : 'none',
                            background: '#000',
                        }}
                    />
                )}

                {/* Iframe BACK (absoluto, ocupa todo) */}
                {hasBack && (
                    <iframe
                        ref={iBack}
                        src={backSrc}
                        title="Vimeo back"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0,
                            zIndex: active === 'back' ? 2 : 1,
                            pointerEvents: active === 'back' ? 'auto' : 'none',
                            background: '#000',
                        }}
                    />
                )}

                {/* Controles abajo derecha (siempre visibles) */}
                <div
                    style={{
                        position: 'absolute',
                        right: 12,
                        bottom: 40,
                        display: 'flex',
                        gap: 8,
                        zIndex: 5,
                    }}
                >
                    <Btn onClick={() => setActive('front')} active={active === 'front'}>Delantera</Btn>
                    <Btn onClick={() => setActive('back')} active={active === 'back'}>Trasera</Btn>
                    <Btn onClick={toggleFullscreen}>{fs ? 'Salir' : 'Pantalla completa'}</Btn>
                </div>

                {/* Mensajes de error si alguna URL no es válida */}
                {(errors.front && active === 'front') && (
                    <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#ffd84d', fontWeight: 700, zIndex: 6 }}>
                        {errors.front}
                    </div>
                )}
                {(errors.back && active === 'back') && (
                    <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#ffd84d', fontWeight: 700, zIndex: 6 }}>
                        {errors.back}
                    </div>
                )}
                {(!hasFront && !hasBack) && (
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff' }}>
                        No hay vídeos configurados.
                    </div>
                )}
            </div>
        </div>
    );
}
