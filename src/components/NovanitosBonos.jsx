import React from 'react';
import './NovanitosBonos.css';
import { API, BASE } from '../config';

const NovanitosBonos = () => {
    return (
        <div className="novanitos-container">
            <h2>¿Quieres ganar más novanitos?</h2>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>

            <div className="bonos-grid">
                <div className="bono-card">
                    <h3>Completa un curso completo y consigue</h3>
                    <p className="novanitos-cantidad">260 <span>novanitos</span></p>
                    <button>Ver cursos</button>
                </div>

                <div className="bono-card">
                    <h3>Completa una clase durante 10 días seguidos y consigue</h3>
                    <p className="novanitos-cantidad">570 <span>novanitos</span></p>
                    <button>Ver cursos</button>
                </div>

                <div className="bono-card">
                    <h3>Empieza una nueva clase y consigue</h3>
                    <p className="novanitos-cantidad">56 <span>novanitos</span></p>
                    <button>Ver cursos</button>
                </div>

                <div className="bono-card">
                    <h3>Completa 3 clases del mismo estilo y consigue</h3>
                    <p className="novanitos-cantidad">102 <span>novanitos</span></p>
                    <button>Ver cursos</button>
                </div>
            </div>
        </div>
    );
};

export default NovanitosBonos;
