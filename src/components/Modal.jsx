import React, { useEffect } from 'react';
import './Modal.css';
import { API, BASE } from '../config';

export default function Modal({ children, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
                {children}
            </div>
        </div>
    );
}
