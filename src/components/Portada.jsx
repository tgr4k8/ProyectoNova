import React, { useState } from 'react';
import './Portada.css';
import { API, BASE } from '../config';



const Portada = ({ titulo, descripcion }) => {
    const images = [
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
        'parejaRectangulo.png',
    ];
    return (
        <div className="slider-container">
            <div className="images-row">
                {images.map((src, idx) => (
                    <img
                        key={idx}
                        src={`/${src}`}
                        alt={`Imagen ${idx + 1}`}
                        className={`delay-${idx}`}
                    />
                ))}
                <img
                    src="/dancingpair.jpg"
                    alt="Imagen final"
                    className="img-fill delay-last"
                />
            </div>

            <div className="overlay-content">
                <h2>{titulo}</h2>
                <p dangerouslySetInnerHTML={{ __html: descripcion }} />
                <button
                    className="btn btn-alert btn-portada"
                    onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
                >
                    Comenzar exploración
                </button>
            </div>
        </div>);
};
export default Portada;