import React from 'react';
import './ComplementoTarifa.css';
import { API, BASE } from '../config';

const ComplementoTarifa = ({ planes }) => {
    return (
        <div className="complemento-tarifa-container">
            <h3>¡Complementa tu tarifa!</h3>
            <div className="planes-container">
                {planes.map((plan) => (
                    <div key={plan.id} className="plan-card">
                        <img src={plan.imagen} alt={plan.titulo} />
                        <div className="plan-info">
                            <h4>{plan.titulo}</h4>
                            <p className="precio">{plan.precio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplementoTarifa;
