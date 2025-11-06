import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const CheckoutPaso1 = () => {
    const navigate = useNavigate();
    const [mostrarPopup, setMostrarPopup] = useState(false);

    return (
        <div className="main-container">
            <h2>Introduce tus datos</h2>
            <div className="form-grid">
                <input type="text" placeholder="Nombre" />
                <input type="text" placeholder="Apellidos" />
                <input type="email" placeholder="Correo electrónico" />
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
            <button className="btn" onClick={() => setMostrarPopup(true)}>Ver tarifas</button>
            <button className="btn" onClick={() => navigate("/tarifas/checkout2")}>Continuar</button>

            {mostrarPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Porque conformarse con un complemento...</h3>
                        <p>Echa un ojo a nuestras tarifas y accede a todos los contenidos</p>
                        <div className="tarifas-grid">
                            <div className="tarifa-card">
                                <h3>Tarifa mensual</h3>
                                <p>17,98 €/mes</p>
                            </div>
                            <div className="tarifa-card">
                                <h3>Tarifa anual</h3>
                                <p>201,99 €/año</p>
                            </div>
                            <div className="tarifa-card">
                                <h3>Tarifa semestral</h3>
                                <p>72,98 €/semestre</p>
                            </div>
                        </div>
                        <button className="btn" onClick={() => setMostrarPopup(false)}>Empezar con esta tarifa</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPaso1;