import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useCheckout } from '../../context/CheckoutContext';

const ADDONS = [
    { id: 'vip', title: 'Acceso VIP a eventos', priceCents: 499 },
    { id: 'camiseta', title: 'Camiseta oficial', priceCents: 1999 },
];

function cents(n) { return (n / 100).toFixed(2).replace('.', ',') + ' €'; }

export default function CheckoutPaso1() {
    const { state, setPlan, toggleAddon, totalCents } = useCheckout();
    const navigate = useNavigate();
    const location = useLocation();

    const close = () => navigate(-1);

    return (
        <Modal onClose={close}>
            <div className="modal-header">
                <h2>Tu suscripción</h2>
                <br />
                <p style={{ opacity: .7, margin: 0 }}>Confirma el plan y añade complementos opcionales.</p>
            </div>

            {!state.plan ? (
                <div style={{ color: '#b91c1c', margin: '8px 0 12px' }}>No hay plan seleccionado. Cierra y selecciona una tarifa.</div>
            ) : (
                <>
                    <div style={{ marginBottom: 12 }}>
                        <b>Plan:</b> {state.plan.title} ({state.plan.interval}) — {cents(state.plan.priceCents)}
                    </div>

                    <div style={{ margin: '8px 0' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Complementos</div>
                        {ADDONS.map(a => {
                            const checked = !!state.addons.find(x => x.id === a.id);
                            return (
                                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleAddon(a)}
                                    />
                                    <span style={{ flex: 1 }}>{a.title}</span>
                                    <span>{cents(a.priceCents)}</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="checkout-summary">
                        <div className="row"><span>Plan</span><span>{cents(state.plan.priceCents)}</span></div>
                        {state.addons.map(a => (
                            <div className="row" key={a.id}><span>{a.title}</span><span>{cents(a.priceCents)}</span></div>
                        ))}
                        <div className="row total"><span>Total</span><span>{cents(totalCents)}</span></div>
                    </div>
                </>
            )}

            <div className="modal-actions">
                <button onClick={close}>Cerrar</button>
                <button
                    className="btn"
                    onClick={() => navigate('/checkout/paso2', { state: { background: location.state?.background || location } })}
                    disabled={!state.plan}
                >
                    Continuar
                </button>
            </div>
        </Modal>
    );
}
