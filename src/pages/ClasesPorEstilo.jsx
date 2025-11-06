// client/src/pages/EstiloClases.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assetUrl } from '../utils/assets';
import './ClasesPorEstilo.css';


export default function EstiloClases() {
    const { estiloId } = useParams();
    const navigate = useNavigate();
    const [estilo, setEstilo] = useState(null);
    const [clases, setClases] = useState([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setMsg('');
                const { data: est } = await axios.get(`/api/estilos/${estiloId}`);
                setEstilo(est || null);
                const { data: cls } = await axios.get(`/api/clases`, { params: { estiloId } });
                setClases(Array.isArray(cls) ? cls : []);
            } catch (e) {
                setMsg('No se pudieron cargar los datos.');
                setEstilo(null); setClases([]);
            }
        })();
    }, [estiloId]);

    const descShort = (t = '') => {
        const s = (t || '').trim();
        if (!s) return '';
        return s.length > 140 ? s.slice(0, 140) + '…' : s;
    };

    // 👇 NUEVO: función para obtener la mejor portada posible con fallback
    const portadaDe = (c) =>
        assetUrl(c?.imagenPortada || (c?.clave ? `/imagenes/${c.clave}.png` : '/imagenes/default.png'));

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
            <h1>Clases de estilo</h1>
            {estilo && (
                <p style={{ opacity: 0.8, marginTop: -4 }}>
                    Estilo: <b>{estilo.nombre}</b>
                    {estilo.Grupo?.nombre ? <> · Grupo: <b>{estilo.Grupo.nombre}</b></> : null}
                </p>
            )}

            {msg && <div style={{ color: 'crimson', marginTop: 8 }}>{msg}</div>}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 16,
                    marginTop: 16
                }}
            >
                {clases.map((c) => (
                    <div
                        key={c.id}
                        style={{
                            border: '1px solid #eee',
                            borderRadius: 10,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#f5f5f5' }}>
                            {(
                                <img
                                    src={portadaDe(c)}
                                    alt={c.nombre}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = assetUrl('/imagenes/default.png');
                                    }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ padding: 12 }}>
                            <h3 style={{ margin: 0 }}>{c.nombre}</h3>
                            <p style={{ margin: '6px 0 10px', opacity: 0.8 }}>{descShort(c.descripcion)}</p>
                            <button onClick={() => navigate(`/clases/${c.id}`)} className="btnClase">
                                Ver clase
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
