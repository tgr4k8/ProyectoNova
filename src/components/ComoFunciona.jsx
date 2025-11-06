import React, { useState, useRef, useLayoutEffect } from "react";
import "./ComoFunciona.css";
import { Link } from 'react-router-dom';
import { API, BASE } from '../config';

const niveles = [
    {
        nombre: "Mercurio",
        subtitulo: "Nivel principiante",
        items: ["Giros", "Coreografías nivel inicio", "Técnicas de inicio", "Brazos", "Cabezos", "Footwork"],
    },
    {
        nombre: "Marte",
        subtitulo: "Nivel avanzado",
        items: ["Giros", "Coreografías nivel inicio", "Técnicas de inicio", "Brazos", "Cabezos", "Footwork", "Retos"],
    },
    {
        nombre: "Tierra",
        subtitulo: "Cuida tu bienestar",
        items: ["Flexibilidad", "Zumba", "Estiramientos", "Calentamientos para bailarines", "Rutinas de ejercicio con o sin material"],
    },
    {
        nombre: "Plutón",
        subtitulo: "Para los más peques",
        items: ["Coreografías infantiles", "Movimiento psicomotricidad", "Tramos", "Musicalidad para niños", "Coreografías conjuntas con los padres"],
    },
    {
        nombre: "Luna",
        subtitulo: "Destinado a eventos",
        items: ["No hay nada definido aquí.", "NO INFOOOOO"],
    },
];

const estilos = ["Estilo libre", "Urbano", "Clásico", "Fusión", "Experimental"];

const ComoFunciona = () => {
    const [pasoActivo, setPasoActivo] = useState(null);
    const contentRef = useRef();

    const handlePasoClick = (id) => {
        setPasoActivo(prev => prev === id ? null : id);
    };

    const renderContenido = () => {
        if (pasoActivo === null) return null;

        switch (pasoActivo) {
            case 1:
                return (
                    <div className="bg-dark text-white p-4 rounded">
                        <h5 className="text-warning">Elige tu nivel de aprendizaje</h5>
                        <div className="row mt-3">
                            {niveles.map((nivel, idx) => (
                                <div key={idx} className="col-12 col-md-6 col-lg-2 mb-3">
                                    <h6 className="text-warning">{nivel.nombre}</h6>
                                    <small className="fst-italic">{nivel.subtitulo}</small>
                                    <ul className="small mt-2 ps-3">
                                        {nivel.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="bg-dark text-white p-4 rounded">
                        <h5 className="text-warning">Selecciona tu estilo de baile</h5>
                        <ul className="mt-3">{estilos.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    </div>
                );
            case 3:
                return (
                    <div className="bg-dark text-white p-4 rounded">
                        <h5 className="text-warning">Contrata tu plan</h5>
                        <p>Selecciona un plan que se ajuste a tus necesidades y empieza hoy mismo.</p>
                        <ul>
                            <li>Planes mensuales, semestrales y anuales</li>
                            <li>Acceso a todo el contenido</li>
                            <li>Sin permanencia</li>
                        </ul>
                    </div>
                );
            case 4:
                return (
                    <div className="bg-success text-white p-4 rounded">
                        <h5 className="text-warning">¡Empieza a darle ritmo!</h5>
                        <p>Ya estás listo para comenzar tu experiencia. Explora, entrena y disfruta cada paso.</p>
                        <p>¡Bienvenido a bordo!</p>
                    </div>
                );
            default:
                return null;
        }
    };

    useLayoutEffect(() => {
        if (contentRef.current) {
            if (pasoActivo === null) {
                contentRef.current.style.maxHeight = "0px";
            } else {
                const scrollHeight = contentRef.current.scrollHeight;
                contentRef.current.style.maxHeight = `${scrollHeight}px`;
            }
        }
    }, [pasoActivo]);

    return (
        <div className="container py-5">
            <h2 className="mb-4 fw-bold">¿Cómo funciona?</h2>

            <div className="d-flex justify-content-center align-items-center mb-4 steps-wrapper">
                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="text-center flex-fill" onClick={() => handlePasoClick(num)} style={{ cursor: 'pointer' }}>
                        <div className={`step-circle ${pasoActivo === num ? "active-step" : ""}`}>{num}</div>
                        <div className="step-label mt-2 small fw-semibold">
                            {num === 1 ? "Elige tu nivel" :
                                num === 2 ? "Selecciona tu estilo" :
                                    num === 3 ? "Contrata" : "¡A bailar!"}
                        </div>
                    </div>
                ))}
            </div>

            <div ref={contentRef} className={`expandible`}>
                <div className="contenido-inner">{renderContenido()}</div>
            </div>

            <div className="text-center mt-4">
                <Link to="/tarifas" className="btn btn-alert px-4 py-2 fw-bold">
                    Empezar ahora
                </Link>
            </div>
        </div>
    );
};

export default ComoFunciona;
