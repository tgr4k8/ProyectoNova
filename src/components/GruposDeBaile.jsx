import React, { useEffect, useMemo, useRef, useState } from "react";
import "./GruposDeBaile.css";
import { Link, useLocation } from "react-router-dom";
import { API, BASE } from '../config';

export default function GruposDeBaile({
    grupos = [],                 // [{id, nombre, nivel, descripcion, clave, imagenUrl}, ...]
    grupoSeleccionadoId = null,  // id desde el padre (opcional)
    onSelectGrupo,               // (grupo) => void
    ...props
}) {
    const location = useLocation();

    // índice activo (central). Nunca reordenamos el array; solo movemos por estilos.
    const [activeIndex, setActiveIndex] = useState(0);
    const lastEmittedId = useRef(null);

    // Sincroniza con el id que venga del padre (si es distinto al central actual)
    useEffect(() => {
        if (!grupos.length || !grupoSeleccionadoId) return;
        const idx = grupos.findIndex(g => g.id === grupoSeleccionadoId);
        if (idx !== -1 && idx !== activeIndex) setActiveIndex(idx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grupoSeleccionadoId, grupos.length]);

    // Emite al padre cuando cambia el grupo central (sin bucles)
    useEffect(() => {
        const g = grupos[activeIndex];
        if (!g?.id) return;
        if (lastEmittedId.current === g.id) return;
        lastEmittedId.current = g.id;
        onSelectGrupo?.(g);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, grupos]);

    // Número de visibles (hasta 5). Si hay <5 grupos, adaptamos layout para n=1..5
    const visibleCount = Math.min(grupos.length, 5);

    // Calcula el “slot” (0..4) para cada índice real según su distancia circular al activo.
    // Si está a más de 2 posiciones, lo ocultamos (para listas >5).
    const getSlotFor = (i) => {
        if (!grupos.length) return { hidden: true };
        const n = grupos.length;
        // distancia circular mínima [-floor(n/2), ..., +floor(n/2)]
        let d = i - activeIndex;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;

        // para 5 slots, aceptamos distancias -2,-1,0,+1,+2
        if (d < -2 || d > 2) return { hidden: true };

        const slot = d + 2; // map: -2->0, -1->1, 0->2, +1->3, +2->4
        return { hidden: false, slot };
    };

    const imgSrc = (g) =>
        g?.imagenUrl || (g?.clave ? `/imagenes/${g.clave}.png` : "/imagenes/default.png");

    const central = grupos[activeIndex];

    const goLeft = () => setActiveIndex((i) => (i - 1 + grupos.length) % grupos.length);
    const goRight = () => setActiveIndex((i) => (i + 1) % grupos.length);

    // Si no hay grupos, no pintamos nada
    if (!grupos.length) return null;

    return (
        <div className="grupos-container" style={{ zIndex: 1, position: "relative" }} {...props}>
            <h2 className="tituloGrupos">Grupos de baile</h2>

            <div className="info-grupo">
                <h3 key={central?.id}>
                    {central?.nombre}{central?.nivel ? ` - ${central.nivel}` : ""}
                </h3>
                {central?.descripcion && <p>{central.descripcion}</p>}

                {location.pathname !== "/grupos" && (
                    <button className="btn-acceder">
                        <Link to="/grupos" style={{ color: "inherit", textDecoration: "none" }}>
                            Acceder al grupo
                        </Link>
                    </button>
                )}
            </div>

            <div className="planetas">
                <button className="flecha-izquierda" onClick={goLeft}>&lt;</button>

                {/* Renderizamos TODOS los grupos (keys estables), pero solo 5 quedan visibles.
            Nunca cambiamos el orden del map → no hay parpadeos. */}
                {grupos.map((g, i) => {
                    const { hidden, slot } = getSlotFor(i);
                    const cls = hidden ? "hidden" : `pos${slot}`;
                    return (
                        <img
                            key={g.id}
                            src={imgSrc(g)}
                            alt={g.nombre || "grupo"}
                            className={`planeta ${cls}`}
                            onClick={() => {
                                // si es adyacente, permite traerlo al centro con un clic
                                const n = grupos.length;
                                let d = i - activeIndex;
                                if (d > n / 2) d -= n;
                                if (d < -n / 2) d += n;
                                if (d === -1 || d === 1) setActiveIndex(i);
                            }}
                        />
                    );
                })}

                <button className="flecha-derecha" onClick={goRight}>&gt;</button>
            </div>
        </div>
    );
}
