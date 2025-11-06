
/*
import React, { createContext, useState, useEffect } from 'react';

// Crear contexto
export const AuthContext = createContext();

const fakeAuthApi = (email, password) =>
    new Promise((resolve, reject) => {
        // Simula validación backend
        setTimeout(() => {
            if (email === 'user@test.com' && password === '123456') {
                resolve({
                    token: 'fake-jwt-token',
                    user: { name: 'Usuario Test', email }
                });
            } else {
                reject('Email o password incorrectos');
            }
        }, 1000);
    });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al iniciar la app, cargamos usuario y token desde localStorage (si existe)
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fakeAuthApi(email, password);
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
*/
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            // Aquí ejemplo muy básico y fijo para test
            if (email === 'user@test.com' && password === '123456') {
                setUser({ email });
                resolve();
            } else {
                reject('Credenciales incorrectas');
            }
        });
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
