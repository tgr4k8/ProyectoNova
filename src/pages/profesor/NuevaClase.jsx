// client/src/pages/profesor/NuevaClase.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { assetUrl } from '../../utils/assets';
import './NuevaClase.css';


export default function NuevaClase() {
    const [grupos, setGrupos] = useState([]);
    const [estilos, setEstilos] = useState([]);
    const [subiendo, setSubiendo] = useState(false);
    const [esAdmin, setEsAdmin] = useState(false);
    const [esProfesor, setEsProfesor] = useState(false);

    const [form, setForm] = useState({
        grupoId: '',
        estiloId: '',
        nombre: '',
        descripcion: '',
        clave: '',
        portadaUrl: '',
        video1Url: '',
        video2Url: '',
        novanitos: 56, // ✅ por defecto 56
    });

    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const authHeader = () => {
        const t = localStorage.getItem('token');
        return t ? { Authorization: `Bearer ${t}` } : {};
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`/api/auth/perfil`, { headers: { ...authHeader() } });
                const tipo = (data?.tipo || '').toLowerCase();
                setEsAdmin(tipo === 'administrador' || tipo === 'admin');
                setEsProfesor(tipo === 'profesor');
            } catch {
                setEsAdmin(false);
                setEsProfesor(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`/api/grupos`, { headers: { ...authHeader() } });
                setGrupos(Array.isArray(data) ? data : []);
            } catch {
                setGrupos([]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            if (!form.grupoId) { setEstilos([]); setForm(f => ({ ...f, estiloId: '' })); return; }
            try {
                const { data } = await axios.get(`/api/estilos`, {
                    params: { grupoId: form.grupoId },
                    headers: { ...authHeader() },
                });
                setEstilos(Array.isArray(data) ? data : []);
                setForm(f => ({ ...f, estiloId: '' }));
            } catch {
                setEstilos([]);
                setForm(f => ({ ...f, estiloId: '' }));
            }
        })();
    }, [form.grupoId]);

    function onChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    function onChangeNumber(e) {
        const { name, value } = e.target;
        const n = Number(value);
        setForm(f => ({ ...f, [name]: Number.isFinite(n) ? n : '' }));
    }

    async function onFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setMsg(''); setErr(''); setSubiendo(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);

            // usamos el uploader de propuestas (vale para profesor y admin)
            const { data } = await axios.post(`/api/propuestas/upload-imagen`, fd, { headers: { ...authHeader() } });
            const url = data?.url || data?.absoluteUrl || '';
            if (!url) throw new Error('Respuesta de subida sin URL');

            setForm(f => ({ ...f, portadaUrl: url, imagenPortada: url }));
            setMsg('Imagen subida correctamente.');
        } catch (e2) {
            setErr(e2?.response?.data?.error || e2?.message || 'No se pudo subir la imagen');
        } finally {
            setSubiendo(false);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setMsg(''); setErr('');

        if (!esAdmin && !esProfesor) {
            setErr('No tienes permisos para crear clases/propuestas.');
            return;
        }
        if (!form.nombre || !form.grupoId || !form.estiloId) {
            setErr('Rellena nombre, grupo y estilo.');
            return;
        }

        const nov = Number.isFinite(Number(form.novanitos)) ? Number(form.novanitos) : 56;

        try {
            const payload = {
                grupoId: Number(form.grupoId),
                estiloId: Number(form.estiloId),
                nombre: form.nombre,
                clave: form.clave || null,
                descripcion: form.descripcion || null,
                imagenPortada: form.portadaUrl || null,
                portadaUrl: form.portadaUrl || null,
                video1Url: (form.video1Url || '').trim() || null,
                video2Url: (form.video2Url || '').trim() || null,
                // ✅ puntos
                novanitos: nov,
                puntos: nov, // alias por compatibilidad backend
            };

            if (esAdmin) {
                await axios.post(`/api/clases`, payload, { headers: { ...authHeader() } });
                setMsg('Clase creada correctamente.');
            } else {
                if (!form.clave) {
                    setErr('La clave es obligatoria para enviar una propuesta.');
                    return;
                }
                await axios.post(`/api/propuestas`, payload, { headers: { ...authHeader() } });
                setMsg('Propuesta enviada para revisión.');
            }

            setForm(f => ({
                ...f,
                nombre: '',
                descripcion: '',
                clave: '',
                portadaUrl: '',
                video1Url: '',
                video2Url: '',
                novanitos: 56, // reset por defecto
            }));
        } catch (e2) {
            setErr(e2?.response?.data?.error || 'Error al guardar la clase/propuesta');
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Nueva clase</h1>

            <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
                <label>Grupo
                    <select name="grupoId" value={form.grupoId} onChange={onChange}>
                        <option value="">-- elige --</option>
                        {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </select>
                </label>

                <label>Estilo
                    <select name="estiloId" value={form.estiloId} onChange={onChange} disabled={!form.grupoId}>
                        <option value="">-- elige --</option>
                        {estilos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </label>

                <label className="md:col-span-2">Nombre
                    <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre de la clase" />
                </label>

                <label className="md:col-span-2">Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={4} />
                </label>


                <label className="md:col-span-2">Clave (para propuestas)
                    <input name="clave" value={form.clave} onChange={onChange} placeholder="p.ej. CLASE-SEP-2025" />
                </label>


                {/* ✅ NOVANITOS */}
                <label>Novanitos (puntos)
                    <input
                        type="number"
                        name="novanitos"
                        min={0}
                        step={1}
                        value={form.novanitos}
                        onChange={onChangeNumber}
                        placeholder="56"
                    />
                </label>

                <div className="md:col-span-2">
                    <label>Portada (archivo)
                        <input type="file" accept="image/*" onChange={onFile} disabled={subiendo || (!esAdmin && !esProfesor)} />
                    </label>
                    {form.portadaUrl && (
                        <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Vista previa:</div>
                            <img
                                src={assetUrl(form.portadaUrl)}
                                alt="Portada de la clase"
                                style={{ maxWidth: 360, width: '100%', borderRadius: 8, border: '1px solid #ddd' }}
                            />
                        </div>
                    )}
                </div>

                <label>Vídeo 1 (URL) Delantera
                    <input name="video1Url" value={form.video1Url} onChange={onChange} placeholder="https://player.vimeo.com/video/..." />
                </label>

                <label>Vídeo 2 (URL) Trasera
                    <input name="video2Url" value={form.video2Url} onChange={onChange} placeholder="https://player.vimeo.com/video/..." />
                </label>

                {msg && <div className="ok md:col-span-2">{msg}</div>}
                {err && <div className="error md:col-span-2">{err}</div>}

                <div className="md:col-span-2">
                    <button type="submit" className="btn" disabled={!esAdmin && !esProfesor}>Guardar</button>
                </div>
            </form>
        </div>
    );
}
