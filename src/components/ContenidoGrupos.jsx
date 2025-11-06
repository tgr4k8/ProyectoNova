import React, { useEffect, useMemo, useState } from 'react';
import './ContenidoGrupos.css';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../utils/assets';
import { API, BASE } from '../config';

export default function ContenidoGrupos({ grupo, estilos = [] }) {
    const [busqueda, setBusqueda] = useState('');
    const navigate = useNavigate();

    // resetear filtro cuando cambia el grupo
    useEffect(() => { setBusqueda(''); }, [grupo?.id]);

    const estilosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        const arr = Array.isArray(estilos) ? estilos : [];
        if (!q) return arr;
        return arr.filter(e => (e.nombre || e.titulo || '').toLowerCase().includes(q));
    }, [busqueda, estilos]);

    const total = Array.isArray(estilos) ? estilos.length : 0;
    const visibles = estilosFiltrados.length;

    const imgFor = (e) => {
        if (e.imagenUrl) return assetUrl(e.imagenUrl); // ✅ resuelve /uploads/...
        const nombre = (e.nombre || e.titulo || '').toLowerCase().replace(/\s+/g, '');
        return nombre ? `/imagenes/${nombre}.jpg` : '/imagenes/default.png';
    };

    if (!grupo) {
        return (
            <div className="grupos-container1">
                <h2>Descripción</h2>
                <p className="descripcion-texto">
                    Selecciona un grupo para ver su información y estilos disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className="grupos-container1" key={grupo.id}>
            <h2>Descripción</h2>
            <p className="descripcion-texto">
                {grupo.descripcion || 'Selecciona un grupo para ver su información y estilos disponibles.'}
            </p>

            <h2>Estilos del grupo : {grupo.nombre}</h2>
            <p className="descripcion-texto">
                {(visibles > 0 || total > 0)
                    ? 'Explora los estilos asociados al grupo seleccionado.'
                    : 'Aún no hay estilos para este grupo.'}
            </p>

            <div className="filtro-busqueda">
                <input
                    type="text"
                    placeholder="Buscar estilo"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <button onClick={() => setBusqueda(busqueda)}>Filtrar</button>
            </div>

            <div className="lista-estilos">
                {estilosFiltrados.map((estilo) => (
                    <div
                        className="estilo-card"
                        key={estilo.id}
                        onClick={() => navigate(`/estilos/${estilo.id}/clases`)}
                    >
                        <img src={assetUrl(imgFor(estilo))} alt={estilo.nombre || estilo.titulo} />
                        <div className="contenido">
                            <h3>{estilo.nombre || estilo.titulo}</h3>
                            {estilo.descripcion && <p>{estilo.descripcion}</p>}
                        </div>
                    </div>
                ))}

                {total > 0 && visibles === 0 && busqueda.trim() && (
                    <div style={{ opacity: 0.7, padding: '8px 0' }}>
                        No hay estilos que coincidan con “{busqueda}”.
                    </div>
                )}
            </div>
        </div>
    );
}
