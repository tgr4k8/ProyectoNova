import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home'; // Cambiar Home por Inicio
import About from '../pages/About';
import Contact from '../pages/Contact';
import Header from './Header';
import Footer from './Footer';
import '../App.css'; // Asegúrate de que el archivo CSS esté en la carpeta correcta
import { API, BASE } from '../config';

function Layout({ children }) {
    const user = { name: 'David' }; // Simulado
    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <>
            <Header user={user} onLogout={handleLogout} />
            <div className="main-content" style={{ top: '150px' }}>
                <main>
                    {children}
                </main>
            </div >
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Footer />
            </div>
        </>
    );
}

export default Layout;
