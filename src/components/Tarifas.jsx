import React, { useState } from "react";
import "./Tarifas.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useCheckout } from "../context/CheckoutContext"; // ← importa el contexto
import { API, BASE } from '../config';

const planes = [
    {
        id: "mensual",
        titulo: "Tarifa Mensual",
        precio: (
            <>
                17,98 €<br />/mes
            </>
        ),
        // necesarios para el cálculo del total en el checkout
        priceCents: 1798,
        interval: "mes",
        beneficios: [
            "Acceso básico mensual.",
            "Sin compromiso de permanencia.",
            "Cancelación en cualquier momento.",
        ],
    },
    {
        id: "anual",
        titulo: "Tarifa Anual",
        precio: (
            <>
                102,99 €<br />/año
            </>
        ),
        destacado: true,
        priceCents: 10299,
        interval: "año",
        beneficios: [
            "Ahorra más de 35% al año.",
            "Acceso total a todos los contenidos.",
            "Incluye contenido exclusivo y eventos.",
            "Prioridad en reservas y descuentos.",
        ],
    },
    {
        id: "semestral",
        titulo: "Tarifa Semestre",
        precio: (
            <>
                72,98 €<br />/semestre
            </>
        ),
        priceCents: 7298,
        interval: "semestre",
        beneficios: [
            "Ideal si entrenas en temporadas.",
            "Acceso completo 6 meses.",
            "Incluye sesiones especiales.",
        ],
    },
];

const Tarifas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setPlan } = useCheckout(); // ← usa el contexto

    const [seleccionado, setSeleccionado] = useState("anual");
    const planActivo = planes.find((p) => p.id === seleccionado);
    const isTarifasPage = location.pathname === "/tarifas";

    const contratar = (plan, e) => {
        e?.stopPropagation();
        // guarda el plan en el contexto (persistirá en localStorage)
        setPlan({
            id: plan.id,
            title: plan.titulo,
            priceCents: plan.priceCents,
            interval: plan.interval,
        });
        // abre el modal del paso 1 sobre la página actual
        navigate("/checkout/paso1", { state: { background: location } });
    };

    return (
        <div className={`tarifas-container ${isTarifasPage ? "blanco" : ""}`}>
            <h2 className="titulo-tarifas">Nuestras Tarifas</h2>
            <div className="tarifas-contenido">
                <div
                    key={seleccionado}
                    className={`beneficios ${isTarifasPage ? "beneficiosTarifa borde-azul" : ""}`}
                >
                    <h4>La suscripción incluye:</h4>
                    <ul>
                        {planActivo.beneficios.map((beneficio, idx) => (
                            <li key={idx}>✔ {beneficio}</li>
                        ))}
                    </ul>
                </div>

                <div className="tarjetas-tarifa">
                    {planes.map((plan) => (
                        <div
                            key={plan.id}
                            className={`tarjetaTarifa ${seleccionado === plan.id ? "activa" : ""} ${isTarifasPage ? "borde-azul" : ""
                                }`}
                            onClick={() => setSeleccionado(plan.id)}
                        >
                            {plan.destacado && <div className="destacadoMensaje">El más elegido</div>}
                            <h5>{plan.titulo}</h5>
                            <p className="precio">{plan.precio}</p>
                            <button
                                className={`btn-contratarTarifa ${seleccionado === plan.id ? "destacado" : ""}`}
                                onClick={(e) => contratar(plan, e)} // ← aquí redirigimos bien
                            >
                                Contratar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Tarifas;
