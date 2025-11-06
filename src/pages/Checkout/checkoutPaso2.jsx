import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useCheckout } from '../../context/CheckoutContext';

function cents(n) { return (n / 100).toFixed(2).replace('.', ',') + ' €'; }

export default function CheckoutPaso2() {
    const { state, setCustomer, totalCents } = useCheckout();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        name: state.customer?.name || '',
        email: state.customer?.email || '',
    });

    const close = () => navigate(-1);

    return (
        <Modal onClose={close}>
            <div className="modal-header">
                <h2>Datos de facturación</h2>
                <br />
                <p style={{ opacity: .7, margin: 0 }}>Introduce tus datos para continuar.</p>
            </div>

            {!state.plan ? (
                <div style={{ color: '#b91c1c', margin: '8px 0 12px' }}>No hay plan seleccionado. Vuelve al paso anterior.</div>
            ) : (
                <>
                    <div style={{ marginBottom: 12 }}>
                        <b>Plan:</b> {state.plan.title} — {cents(state.plan.priceCents)}
                    </div>

                    <label style={{ display: 'block', margin: '8px 0' }}>
                        Nombre
                        <input
                            style={{ width: '100%' }}
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </label>

                    <label style={{ display: 'block', margin: '8px 0' }}>
                        Email
                        <input
                            style={{ width: '100%' }}
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </label>

                    <div className="checkout-summary">
                        <div className="row"><span>Total</span><span>{cents(totalCents)}</span></div>
                    </div>
                </>
            )}

            <div className="modal-actions">
                <button onClick={close}>Atrás</button>
                <button
                    className="btn"
                    onClick={() => {
                        setCustomer(form);
                        navigate('/checkout/resumen', { state: { background: location.state?.background || location } });
                    }}
                    disabled={!form.name || !form.email}
                >
                    Continuar
                </button>
            </div>
        </Modal>
    );
}
