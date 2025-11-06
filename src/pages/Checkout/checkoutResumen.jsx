import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useCheckout } from '../../context/CheckoutContext';

function cents(n) { return (n / 100).toFixed(2).replace('.', ',') + ' €'; }

export default function CheckoutResumen() {
    const { state, totalCents } = useCheckout();
    const navigate = useNavigate();
    const close = () => navigate(-1);

    const handlePagar = async () => {
        // Aquí harás la llamada a tu backend para crear la sesión de Stripe
        // usando state.plan, state.addons y state.customer.
        // Por ahora, solo mostramos el payload en consola.
        console.log('CHECKOUT PAYLOAD:', state);
        alert('Aquí redirigirías a Stripe con la sesión creada en tu backend.');
    };

    if (!state.plan) {
        return (
            <Modal onClose={close}>
                <div className="modal-header"><h2>Resumen</h2></div>
                <div style={{ color: '#b91c1c' }}>No hay plan seleccionado.</div>
                <div className="modal-actions">
                    <button onClick={close}>Cerrar</button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal onClose={close}>
            <div className="modal-header">
                <h2>Resumen del pedido</h2>
            </div>

            <div className="checkout-summary">
                <div className="row"><span>Plan</span><span>{state.plan.title} — {cents(state.plan.priceCents)}</span></div>
                {state.addons.map(a => (
                    <div className="row" key={a.id}><span>{a.title}</span><span>{cents(a.priceCents)}</span></div>
                ))}
                <div className="row"><span>Cliente</span><span>{state.customer?.name} · {state.customer?.email}</span></div>
                <div className="row total"><span>Total</span><span>{cents(totalCents)}</span></div>
            </div>

            <div className="modal-actions">
                <button onClick={() => navigate(-1)}>Atrás</button>
                <button className="btn" onClick={handlePagar}>Ir a pagar</button>
            </div>
        </Modal>
    );
}
