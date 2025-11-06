import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./CalendarioPersonalizado.css";
import { API, BASE } from '../config';
import { assetUrl } from '../utils/assets';



const diasSemana = ["Lu", "Mar", "Mi", "Ju", "Vi", "Sa", "Dom"];
const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const generarDiasDelMes = (año, mes) => {
    const dias = [];
    const fechaInicio = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    let diaSemana = fechaInicio.getDay(); // 0=Dom
    let offset = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes=0
    for (let i = 0; i < offset; i++) dias.push(null);
    for (let d = 1; d <= ultimoDia; d++) dias.push(d);
    return dias;
};

function isoOf(año, mes0, dia) {
    const y = String(año);
    const m = String(mes0 + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function CalendarioPersonalizado() {
    const hoy = new Date();
    const [año, setAño] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth());
    const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());

    const [isAdmin, setIsAdmin] = useState(false);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [adding, setAdding] = useState(false);
    const [upMsg, setUpMsg] = useState('');
    const [upErr, setUpErr] = useState('');
    const [form, setForm] = useState({
        nombre: '', descripcion: '', fecha: '', imagenUrl: '', linkUrl: ''
    });
    const [subiendo, setSubiendo] = useState(false);

    const authHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get(`/api/auth/perfil`, { headers: { ...authHeader() } })
            .then(res => setIsAdmin((res.data?.tipo || '').toLowerCase() === 'administrador'))
            .catch(() => setIsAdmin(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true); setMsg('');
            try {
                const { data } = await axios.get(`/api/eventos`, { params: { year: año, month: mes + 1 } });
                setEventos(Array.isArray(data) ? data : []);
            } catch (e) {
                setEventos([]); setMsg('No se pudieron cargar los eventos.');
            } finally { setLoading(false); }
        })();
    }, [año, mes]);

    const dias = generarDiasDelMes(año, mes);
    const ultimoDiaDelMes = new Date(año, mes + 1, 0).getDate();
    const diaValido = Math.min(diaSeleccionado, ultimoDiaDelMes);
    const fechaSeleccionada = new Date(año, mes, diaValido);
    const nombreMesActual = meses[mes].charAt(0).toUpperCase() + meses[mes].slice(1);

    const infoDia = useMemo(() => {
        const diaSemana = fechaSeleccionada.toLocaleDateString("es-ES", { weekday: "long" });
        const mesNombre = fechaSeleccionada.toLocaleDateString("es-ES", { month: "long" });
        return {
            diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
            dia: fechaSeleccionada.getDate(),
            mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
            iso: isoOf(año, mes, diaValido),
        };
    }, [año, mes, diaValido]);

    const eventosPorFecha = useMemo(() => {
        const map = {};
        for (const ev of eventos) (map[ev.fecha] ||= []).push(ev);
        return map;
    }, [eventos]);

    const eventosDelDia = eventosPorFecha[infoDia.iso] || [];

    const cambiarMes = (delta) => {
        let nuevoMes = mes + delta, nuevoAño = año;
        if (nuevoMes < 0) { nuevoMes = 11; nuevoAño -= 1; }
        else if (nuevoMes > 11) { nuevoMes = 0; nuevoAño += 1; }
        setMes(nuevoMes); setAño(nuevoAño);
        const nuevoUltimoDia = new Date(nuevoAño, nuevoMes + 1, 0).getDate();
        setDiaSeleccionado(prev => Math.min(prev, nuevoUltimoDia));
    };

    function onChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function onFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUpErr(''); setUpMsg(''); setSubiendo(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const { data } = await axios.post(`/api/eventos/upload-imagen`, fd, {
                headers: { 'Content-Type': 'multipart/form-data', ...authHeader() },
            });
            // 👇 Acepta distintas claves que pueda devolver el backend
            const url =
                data?.relativeUrl ||
                data?.relativePath ||
                data?.url ||
                data?.path ||
                data?.absoluteUrl ||
                '';
            if (!url) throw new Error('Respuesta sin URL');
            setForm(f => ({ ...f, imagenUrl: url }));
            setUpMsg('Imagen subida correctamente.');
        } catch (e2) {
            setUpErr(e2?.response?.data?.error || 'No se pudo subir la imagen');
        } finally { setSubiendo(false); }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setUpErr(''); setUpMsg('');
        try {
            const payload = {
                nombre: form.nombre,
                descripcion: form.descripcion || '',
                fecha: form.fecha || infoDia.iso,
                imagenUrl: form.imagenUrl || null,
                linkUrl: form.linkUrl || null,
            };
            await axios.post(`/api/eventos`, payload, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
            setUpMsg('✅ Evento creado.');
            setAdding(false);
            const { data } = await axios.get(`/api/eventos`, { params: { year: año, month: mes + 1 } });
            setEventos(Array.isArray(data) ? data : []);
        } catch (e2) {
            const detalle = e2?.response?.data?.detalle || e2?.response?.data?.error;
            setUpErr(detalle || 'No se pudo crear el evento');
            console.error('Crear evento fallo:', e2?.response?.data || e2);
        }
    }

    return (
        <div className="calendario-container">
            <div className="calendario">
                <h3 key={`${mes}-${año}`} style={{ color: 'black' }}>
                    <button className="mesSelect" onClick={() => cambiarMes(-1)}>&lt;</button>{" "}
                    {nombreMesActual} {año}{" "}
                    <button className="mesSelect" onClick={() => cambiarMes(1)}>&gt;</button>
                </h3>

                {loading && <div className="cal-loading">Cargando…</div>}
                {msg && !loading && <div className="cal-error">{msg}</div>}

                <div className="dias-semana">
                    {diasSemana.map((d, i) => (
                        <div key={i} className={`dia-header ${i === 6 ? "domingo" : ""}`}>{d}</div>
                    ))}
                </div>

                <div className="dias-mes">
                    {dias.map((d, i) => {
                        const isSelected = d === Math.min(diaSeleccionado, new Date(año, mes + 1, 0).getDate());
                        const iso = d ? isoOf(año, mes, d) : null;
                        const hasEvent = !!(iso && eventosPorFecha[iso]?.length);
                        return (
                            <div
                                key={i}
                                className={[
                                    "dia",
                                    isSelected ? "activo" : "",
                                    ((i + 1) % 7 === 0) ? "rojo" : "",
                                    hasEvent ? "con-evento" : ""
                                ].join(' ')}
                                onClick={() => d && setDiaSeleccionado(d)}
                                title={hasEvent ? 'Hay evento' : ''}
                            >
                                {d || ''}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="detalle-dia">
                <div className="detalle-header">
                    <h4>{`${infoDia.diaSemana}, ${infoDia.dia} de ${infoDia.mes}`}</h4>
                    {isAdmin && (
                        <button className="btn-add" onClick={() => {
                            setAdding(a => !a);
                            setForm({ nombre: '', descripcion: '', fecha: infoDia.iso, imagenUrl: '', linkUrl: '' });
                            setUpErr(''); setUpMsg('');
                        }}>
                            {adding ? 'Cancelar' : 'Añadir evento'}
                        </button>
                    )}
                </div>

                {isAdmin && adding && (
                    <form className="form-evento" onSubmit={onSubmit}>
                        {upErr && <div className="alert error">{upErr}</div>}
                        {upMsg && <div className="alert ok">{upMsg}</div>}

                        <label>Fecha
                            <input type="date" name="fecha" value={form.fecha || infoDia.iso} onChange={onChange} required />
                        </label>

                        <label>Nombre
                            <input name="nombre" value={form.nombre} onChange={onChange} required />
                        </label>

                        <label>Descripción
                            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} />
                        </label>

                        <label>Link para apuntarse
                            <input name="linkUrl" value={form.linkUrl} onChange={onChange} placeholder="https://..." />
                        </label>

                        <div className="upload-block">
                            <label>Imagen (URL)
                                <input name="imagenUrl" value={form.imagenUrl} onChange={onChange} placeholder="/uploads/eventos/....jpg o https://..." />
                            </label>

                            <label>Imagen (subir archivo)
                                <input type="file" accept="image/*" onChange={onFileChange} disabled={subiendo} />
                                {subiendo && <div className="hint">Subiendo imagen…</div>}
                            </label>

                            {form.imagenUrl && (
                                <div className="preview">
                                    {/* 👇 NUEVO: normalizamos para que /uploads/... se vea */}
                                    <img src={assetUrl(form.imagenUrl)} alt="Cartel" />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-guardar">Guardar evento</button>
                    </form>
                )}

                {!adding && (
                    <>
                        {(eventosDelDia.length ? eventosDelDia : []).map(ev => (
                            <div key={ev.id} className="evento-card">
                                {ev.imagenUrl && (
                                    <div className="evento-img">
                                        {/* 👇 NUEVO: normalizamos la portada desde DB */}
                                        <img src={assetUrl(ev.imagenUrl)} alt={ev.nombre} />
                                    </div>
                                )}
                                <div className="evento-body">
                                    <h5 className="evento-title">{ev.nombre}</h5>
                                    <p className="evento-desc">{ev.descripcion || 'Sin descripción.'}</p>
                                    {ev.linkUrl && (
                                        <a href={ev.linkUrl} className="btn-reservar" target="_blank" rel="noreferrer">
                                            Reserva tu plaza
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {!eventosDelDia.length && (
                            <div className="no-evento">No hay evento para este día.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
