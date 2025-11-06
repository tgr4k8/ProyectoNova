import React, { useState } from "react";
import "./ComoFuncionaMobile.css"; // Puedes adaptar los estilos aquí
import GruposDeBaile from "../components/GruposDeBaile";
import Portada from "../components/Portada";

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

const ComoFuncionaMobile = () => {
    const [pasoActivo, setPasoActivo] = useState(null);

    const renderContenido = () => {
        switch (pasoActivo) {
            case 1:
                return (
                    <div className="contenido">
                        <h5>Elige tu nivel de aprendizaje</h5>
                        {niveles.map((nivel, idx) => (
                            <div key={idx} className="nivel-item">
                                <h6>{nivel.nombre}</h6>
                                <small>{nivel.subtitulo}</small>
                                <ul>
                                    {nivel.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="contenido">
                        <h5>Selecciona tu estilo de baile</h5>
                        <ul>
                            {estilos.map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    </div>
                );
            case 3:
                return (
                    <div className="contenido">
                        <h5>Contrata tu plan</h5>
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
                    <div className="contenido">
                        <h5>¡Empieza a darle ritmo!</h5>
                        <p>Ya estás listo para comenzar tu experiencia. Explora, entrena y disfruta cada paso.</p>
                        <p>¡Bienvenido a bordo!</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mobile-container">
            <Portada titulo={"¿Cómo funciona?"} descripcion={"Lorem ipsum dolor sit amet consectetur adipisicing elit.<br> Quia, voluptatum? Doloremque, quia, voluptatum?"} />

            <div className="steps">
                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className={`step ${pasoActivo === num ? "active" : ""}`} onClick={() => setPasoActivo(num)}>
                        <div className="circle">{num}</div>
                        <div className="label">
                            {num === 1 ? "Elige nivel" : num === 2 ? "Selecciona estilo" : num === 3 ? "Contrata" : "¡A bailar!"}
                        </div>
                    </div>
                ))}
            </div>
            <div className="contenido-wrapper">{renderContenido()}</div>
            <div className="button-wrapper">
                <button className="btn-empezar">Empezar ahora</button>
            </div>
            <GruposDeBaile />
        </div>

    );
};

export default ComoFuncionaMobile;
