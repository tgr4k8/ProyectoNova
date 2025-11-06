// CheckoutPaso2.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const CheckoutPaso2 = () => {
    const navigate = useNavigate();
    return (
        <div className="main-container">
            <h2>Datos de pago</h2>
            <div className="form-grid">
                <input type="text" placeholder="Número de tarjeta" />
                <input type="text" placeholder="Fecha de caducidad" />
                <input type="text" placeholder="CVV" />
            </div>
            <div className="tarifas-grid">
                <div className="tarifa-card">
                    <h3>Tarifa mensual</h3>
                    <p>14,99 €/mes</p>
                </div>
                <div className="tarifa-card">
                    <h3>Plan Plus</h3>
                    <p>2,99 €/mes</p>
                </div>
                <div className="tarifa-card">
                    <h3>Total</h3>
                    <p>17,98 €/mes</p>
                </div>
            </div>
            <button className="btn" onClick={() => navigate("/tarifas/checkout3")}>Finalizar</button>
        </div>
    );
};

export default CheckoutPaso2;