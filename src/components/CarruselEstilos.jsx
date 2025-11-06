import React, { useEffect, useMemo, useState } from "react";
import "./CarruselEstilos.css";

const estilos = [
    { nombre: "Urbano", imagen: "/imagenes/urban.jpg", descripcion: "Estilo urbano con mucha energía" },
    { nombre: "Zouk", imagen: "/imagenes/zouk.jpg", descripcion: "Movimiento fluido y conexión" },
    { nombre: "Bachata", imagen: "/imagenes/bachata.jpg", descripcion: "Ritmo sensual y romántico" },
    { nombre: "Hip Hop", imagen: "/imagenes/hiphop.jpg", descripcion: "Expresión y actitud en cada paso" },
    { nombre: "Salsa", imagen: "/imagenes/salsa.jpg", descripcion: "Sabor latino y técnica" },
    { nombre: "Afro", imagen: "/imagenes/afro.jpg", descripcion: "Ritmos africanos con fuerza y alma" },
];

const CarruselEstilos = () => {
    const total = estilos.length;

    // visible dinámico: 4 desktop, 2 móvil
    const [visible, setVisible] = useState(4);
    useEffect(() => {
        const update = () => setVisible(window.innerWidth < 768 ? 2 : 4);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // índice circular
    const [startIndex, setStartIndex] = useState(0);

    // avanzar/retroceder SIEMPRE de 1 en 1
    const handlePrev = () => setStartIndex((prev) => (prev - 1 + total) % total);
    const handleNext = () => setStartIndex((prev) => (prev + 1) % total);

    // elementos visibles actuales (con wrap)
    const visibles = useMemo(() => {
        const out = [];
        for (let i = 0; i < Math.min(visible, total); i++) {
            out.push(estilos[(startIndex + i) % total]);
        }
        return out;
    }, [startIndex, visible, total]);

    if (!total) return null;

    return (
        <div className="carrusel-estilos" style={{ zIndex: 1000, backgroundColor: "#fff" }}>
            <h2 className="tituloEstilos">Nuestros estilos</h2>

            <div className="carrusel-contenido">
                <button className="flecha" onClick={handlePrev} aria-label="Anterior">
                    &lt;
                </button>

                <div className="tarjetas" aria-live="polite">
                    {visibles.map((estilo, idx) => (
                        <div
                            key={`${estilo.nombre}-${(startIndex + idx) % total}`}
                            className="tarjeta"
                        >
                            <div className="imagen-container">
                                <img src={estilo.imagen} alt={estilo.nombre} />
                                <div className="descripcion-slide">
                                    <h3>{estilo.nombre}</h3>
                                    <p>{estilo.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="flecha" onClick={handleNext} aria-label="Siguiente">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default CarruselEstilos;
