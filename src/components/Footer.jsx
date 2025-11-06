import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 nova-footer">
            <div className="container">
                <div className="row">
                    {/* Logo + descripción */}
                    <div className="col-md-3 mb-4 footer-brand">
                        <div className="mb-3">
                            <h2 className="fw-bold">
                                NOVA <span className="text-warning">CLUB</span>
                            </h2>
                        </div>
                        <p className="fw-bold foot-subtitle">Lorem ipsum dolor sit amet</p>
                        <p className="foot-paragraph">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>

                    {/* Menú */}
                    <div className="col-md-3 mb-4 footer-menu">
                        <h5 className="fw-bold">Menú</h5>
                        <ul className="list-unstyled foot-list">
                            <li><a href="/grupos" className="text-white text-decoration-none">Grupos</a></li>
                            <li><a href="/tarifas" className="text-white text-decoration-none">Tarifas</a></li>
                            <li><a href="/usuario" className="text-white text-decoration-none">Mi perfil</a></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-md-3 mb-4 footer-contact">
                        <h5 className="fw-bold">Contacto</h5>
                        <ul className="list-unstyled contact-list">
                            <li>
                                <i className="bi bi-telephone-fill me-2" />
                                <span>665656565</span>
                            </li>
                            <li>
                                <i className="bi bi-envelope-fill me-2" />
                                <span>correo@correo.es</span>
                            </li>
                        </ul>
                    </div>

                    {/* Redes sociales */}
                    <div className="col-md-3 mb-4 footer-social">
                        <h5 className="fw-bold">Redes sociales</h5>
                        <ul className="list-unstyled social-list">
                            <li><i className="bi bi-facebook me-2" />Facebook</li>
                            <li><i className="bi bi-tiktok me-2" />TikTok</li>
                            <li><i className="bi bi-instagram me-2" />Instagram</li>
                            <li><i className="bi bi-youtube me-2" />YouTube</li>
                            <li><i className="bi bi-linkedin me-2" />LinkedIn</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
