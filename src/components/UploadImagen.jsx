// client/src/components/UploadImagen.jsx
import React, { useState } from "react";
import axios from "axios";
import { apiBase, assetUrl } from "../utils/assets";
import { API, BASE } from '../config';

export default function UploadImagen({
    tipo,               // "eventos" | "estilos" | "clases"
    value,              // string URL actual (estado en el padre)
    onChange,           // (urlAbsoluta) => void
    label = "Imagen (archivo)"
}) {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const API = apiBase();

    async function onFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setErr(""); setMsg(""); setBusy(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`/api/${tipo}/upload-imagen`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            const url = data?.absoluteUrl || data?.url || '';
            if (!url) throw new Error('Respuesta sin URL');
            onChange(url);
            setMsg("Imagen subida correctamente.");
        } catch (e2) {
            setErr(e2?.response?.data?.error || "No se pudo subir la imagen");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="upload-imagen">
            <label>{label}
                <input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />
            </label>

            <label>URL de imagen (opcional)
                <input
                    type="text"
                    placeholder={assetUrl("/uploads/... o https://...")}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            </label>

            {value ? (
                <div className="preview" style={{ marginTop: 8 }}>
                    <img src={assetUrl(value)} alt="preview" style={{ maxWidth: 260, height: "auto", borderRadius: 8 }} />
                </div>
            ) : null}

            {busy && <div className="hint">Subiendo imagen…</div>}
            {msg && <div className="ok">{msg}</div>}
            {err && <div className="error">{err}</div>}
        </div>
    );
}
