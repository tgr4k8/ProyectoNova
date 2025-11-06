// client/src/pages/Comunidad.jsx
import React, { useEffect, useState } from 'react';
import './Comunidad.css';
import { assetUrl } from '../utils/assets';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/tu-canal'; // <- cámbialo
const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

export default function Comunidad() {
    const [podium, setPodium] = useState([]);     // top 3
    const [ranking, setRanking] = useState([]);   // listado (alrededor de mí o Top-5 si no hay sesión)
    const [myPosition, setMyPosition] = useState(null);
    const [showOnlyTop, setShowOnlyTop] = useState(false); // <- modo público: solo Top-5
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const authHeader = () => {
        const t = localStorage.getItem('token');
        return t ? { Authorization: `Bearer ${t}` } : {};
    };

    async function loadFullRanking() {
        // Intenta modo completo (requiere sesión para me/around)
        const res = await fetch(`/api/usuarios/ranking?top=3&around=12`, { headers: { ...authHeader() } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const top = Array.isArray(data.top) ? data.top : [];
        const around = Array.isArray(data.around) ? data.around : [];
        const meRank = data?.me?.rank ?? null;

        // Si no hay meRank (usuario no logueado o backend no lo envía), caemos a Top-5
        if (!meRank) {
            await loadTop5Fallback(top); // pásale el top3 que ya tenemos para evitar otra llamada si se quiere
            return;
        }

        setPodium(top);
        setRanking(around);
        setMyPosition(meRank);
        setShowOnlyTop(false);
    }

    async function loadTop5Fallback(preloadedTop3 = null) {
        // Modo público: solo Top-5 (no muestra "tu posición")
        // Si no nos han pasado top3 precargado, pedimos top=5 y sacamos de ahí el podio
        if (preloadedTop3 && preloadedTop3.length) {
            try {
                const res = await fetch(`/api/usuarios/ranking?top=5`, { headers: {} });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const top5 = Array.isArray(data.top) ? data.top : [];
                setPodium(preloadedTop3.slice(0, 3));
                setRanking(top5);
            } catch {
                // Si falla esta segunda, al menos pintamos el podio con lo que tengamos y vaciamos el ranking
                setPodium(preloadedTop3.slice(0, 3));
                setRanking(preloadedTop3.slice(0, 5));
            }
        } else {
            // Sin preloadedTop3, hacemos una única llamada y reciclamos
            const res = await fetch(`/api/usuarios/ranking?top=5`, { headers: {} });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const top5 = Array.isArray(data.top) ? data.top : [];
            setPodium(top5.slice(0, 3));
            setRanking(top5);
        }
        setMyPosition(null);
        setShowOnlyTop(true);
    }

    useEffect(() => {
        (async () => {
            setLoading(true); setErr('');
            try {
                // Si hay token, intenta modo completo; si falla, cae a Top-5
                const hasToken = !!localStorage.getItem('token');
                if (hasToken) {
                    await loadFullRanking();
                } else {
                    await loadTop5Fallback();
                }
            } catch (e) {
                console.error(e);
                // Último recurso: intenta al menos Top-5 público
                try {
                    await loadTop5Fallback();
                } catch (e2) {
                    console.error(e2);
                    setErr('No se pudo cargar el ranking.');
                }
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="comunidad">
            {/* HERO */}
            <section className="c-hero">
                <div className="c-container">
                    <h1 className="c-hero__title">¡La comunidad te espera!</h1>
                    <p className="c-hero__text">
                        Únete para aprender, conectar e inspirarte con gente que comparte tu pasión. Accede al canal,
                        participa en retos semanales y consigue novanitos con tus progresos.
                    </p>
                    <div className="c-hero__cta">
                        <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noreferrer" className="btn btn-alert px-4 py-2 fw-bold">
                            <span className="c-wa-dot" aria-hidden /> Acceder al canal de Whatsapp
                        </a>
                    </div>
                </div>
            </section>

            {/* BENEFICIOS / SOCIAL / RETOS */}
            <section className="c-section c-benefits">
                <div className="c-container">
                    <h2 className="c-h2">Beneficios de la comunidad</h2>

                    <div className="c-benefits__grid">
                        {[
                            { title: 'Descuentos especiales', text: 'Ofertas y ventajas por ser parte de la comunidad.' },
                            { title: 'Feedback personalizado', text: 'Consejos de profesores y comunidad para mejorar.' },
                            { title: 'Certificados de participación y nivel', text: 'Reconocimiento por tu esfuerzo y progreso.' },
                            { title: 'Recursos adicionales descargables', text: 'Listas de reproducción, PDFs y material extra.' },
                        ].map((b, i) => (
                            <article key={i} className="c-benefit">
                                <div className="c-yellow-dot" aria-hidden />
                                <div>
                                    <h3 className="c-benefit__title">{b.title}</h3>
                                    <p className="c-benefit__text">{b.text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <div className="c-social-banner">
                <div className="c-container">
                    <strong>Utiliza tus redes sociales. ¡Nos encantaría ver cómo lo haces!</strong>
                    <p>Etiquétanos en tus vídeos con el tag <b>#NovaClubBaile</b>
                        practicando los retos de la semana y comparte tu progreso con la comunidad.</p>
                </div>
            </div>

            {/* LIGA DE NOVANITOS */}
            <section className="c-league">
                <div className="c-container">
                    <h2 className="c-h2 c-h2--light">¡Liga estelar de novanitos!</h2>

                    {loading ? (
                        <div className="c-lead c-lead--light">Cargando ranking…</div>
                    ) : err ? (
                        <div className="c-lead c-lead--light" style={{ color: '#ffd84d' }}>{err}</div>
                    ) : (
                        <>
                            {/* PODIO */}
                            <div className="c-podium">
                                {podium.map((u, i) => (
                                    <div key={u.id ?? i} className={`c-podium__row c-podium__row--${i + 1}`}>
                                        <div className="c-podium__pos">{i + 1}</div>
                                        <div className="c-podium__user">
                                            <img
                                                src={assetUrl(u.avatar) || `https://i.pravatar.cc/80?img=${10 + (u.id % 60)}`}
                                                alt={`Avatar ${u.name}`}
                                                className="c-avatar"
                                            />
                                            <div>
                                                <div className="c-podium__name">{u.name}</div>
                                                <div className="c-podium__handle">{u.handle}</div>
                                            </div>
                                        </div>
                                        <div className="c-podium__score">
                                            {fmt(u.novanitos)} <span>novanitos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* RANKING LISTA */}
                            <div className="c-ranking">
                                <div className="c-ranking__title">
                                    {showOnlyTop
                                        ? <>Top 5 del ranking</>
                                        : <>Tu posición en el ranking: <strong>{myPosition ?? '—'}</strong></>
                                    }
                                </div>

                                <div className="c-ranking__list">
                                    {ranking.map((u, idx) => {
                                        const isMe = !showOnlyTop && u.rank === myPosition;
                                        const pos = showOnlyTop ? (idx + 1) : u.rank; // en Top5 mostramos posición 1..5 local
                                        return (
                                            <div
                                                key={u.id ?? idx}
                                                className={`c-ranking__row ${isMe ? 'is-me' : ''}`}
                                            >
                                                <div className="c-ranking__pos">{pos}</div>
                                                <div className="c-ranking__user">
                                                    <img
                                                        src={assetUrl(u.avatar) || `https://i.pravatar.cc/64?img=${20 + ((u.id ?? idx) % 60)}`}
                                                        alt={`Avatar ${u.name}`}
                                                        className="c-avatar c-avatar--sm"
                                                    />
                                                    <div>
                                                        <div className="c-ranking__name">{u.name}</div>
                                                        <div className="c-ranking__handle">{u.handle}</div>
                                                    </div>
                                                </div>
                                                <div className="c-ranking__score">
                                                    {fmt(u.novanitos)} <span>novanitos</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
