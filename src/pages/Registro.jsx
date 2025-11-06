import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registro() {
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        contrasena: '',
        tipo: 'invitado'
    });
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/auth/register`, form);
            setMensaje('Registro exitoso');
            setForm({ nombre: '', email: '', contrasena: '', tipo: 'invitado' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setMensaje(err.response?.data?.error || 'Error al registrar');
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <input name="nombre" placeholder="Nombre" onChange={handleChange} value={form.nombre} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} value={form.email} required />
                <input name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} value={form.contrasena} required />
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                    <option value="invitado">Invitado</option>
                    <option value="subscrito">Subscrito</option>
                    <option value="profesor">Profesor</option>
                    <option value="administrador">Administrador</option>
                </select>
                <button type="submit">Registrarse</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}

export default Registro;
