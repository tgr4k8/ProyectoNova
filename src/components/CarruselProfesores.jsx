import React, { useEffect, useMemo, useState } from "react";
import "./CarruselProfesores.css";
import { API, BASE } from '../config';

const profesores = [
    { nombre: "María", imagen: "/imagenes/profe1.jpg", descripcion: "Profesor de Zouk" },
    { nombre: "Sergio y Raquel", imagen: "/imagenes/profe2.jpg", descripcion: "Profesor de Bachata" },
    { nombre: "Bonifacio", imagen: "/imagenes/profe3.jpg", descripcion: "Profesor de HipHop" },
    { nombre: "Niggi", imagen: "/imagenes/profe4.jpg", descripcion: "Profesor de Salsa" },
    { nombre: "Bryan", imagen: "/imagenes/salsa.jpg", descripcion: "Profesor de Urban" },
    { nombre: "Afro", imagen: "/imagenes/afro.jpg", descripcion: "Profesor de Afro" },
];

const CarruselProfesores = () => {
    const total = profesores.length;

    // visible: 4 en desktop, 2 en móvil
    const [visible, setVisible] = useState(4);
    useEffect(() => {
        const update = () => setVisible(window.innerWidth < 768 ? 2 : 4);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // índice de inicio (circular)
    const [startIndex, setStartIndex] = useState(0);

    // avanzar/retroceder SIEMPRE de 1 en 1
    const handlePrev = () => setStartIndex((prev) => (prev - 1 + total) % total);
    const handleNext = () => setStartIndex((prev) => (prev + 1) % total);

    // subconjunto visible, con wrap
    const visibles = useMemo(() => {
        const out = [];
        for (let i = 0; i < Math.min(visible, total); i++) {
            out.push(profesores[(startIndex + i) % total]);
        }
        return out;
    }, [startIndex, visible, total]);

    if (!total) return null;

    return (
        <div className="carrusel-profesores">
            <h2 className="tituloProfesores">Nuestros profesores</h2>

            <div className="carruselProf-contenido">
                <button className="flecha" onClick={handlePrev} aria-label="Anterior">
                    &lt;
                </button>

                <div className="tarjetas" aria-live="polite">
                    {visibles.map((profesor, idx) => (
                        <div
                            key={`${profesor.nombre}-${(startIndex + idx) % total}`}
                            className="tarjetaProf"
                        >
                            <div className="imagen-container">
                                <img
                                    src={profesor.imagen}
                                    alt={profesor.nombre}
                                    className="imagen-profesor"
                                />
                                <div className="descripcion-slide">
                                    <h3>{profesor.nombre}</h3>
                                    <p>{profesor.descripcion}</p>
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

export default CarruselProfesores;
