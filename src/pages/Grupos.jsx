import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import GruposDeBaile from '../components/GruposDeBaile';
import ContenidoGrupos from '../components/ContenidoGrupos';
// ✅ usa la config centralizada (NO calcules API/BASE aquí)
import { API, BASE } from '../config';

// (opcional, solo si pintas imágenes que vengan como '/uploads/...'):


export default function Grupos() {
    const [grupos, setGrupos] = useState([]);
    const [grupoSel, setGrupoSel] = useState(null);
    const [estilos, setEstilos] = useState([]);
    const [error, setError] = useState('');
    const cancelRef = useRef(null);

    // Carga grupos al entrar
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`/api/grupos`);
                setGrupos(Array.isArray(data) ? data : []);
                // Si quieres seleccionar automáticamente el primero:
                // if (data?.length) setGrupoSel(data[0]);
                console.log('[Grupos] Cargados:', data?.length ?? 0);
            } catch (e) {
                console.error('[Grupos] Error cargando grupos:', e);
                setError('No se pudieron cargar los grupos');
            }
        })();
    }, []);

    // Carga estilos cada vez que cambia el grupo seleccionado
    useEffect(() => {
        if (!grupoSel?.id) {
            setEstilos([]);
            return;
        }

        // cancelar petición anterior si el usuario cambia de grupo rápido
        if (cancelRef.current) {
            cancelRef.current.abort?.();
            cancelRef.current = null;
        }
        const controller = new AbortController();
        cancelRef.current = controller;

        (async () => {
            try {
                const gid = Number(grupoSel.id); // asegura número
                console.log('[Estilos] Fetch para grupoId =', gid, '->', `/api/estilos?grupoId=${gid}`);
                const { data } = await axios.get(`/api/estilos`, {
                    params: { grupoId: gid },
                    signal: controller.signal,
                });

                if (!Array.isArray(data)) {
                    console.warn('[Estilos] Respuesta inesperada:', data);
                    setEstilos([]);
                    return;
                }

                console.log('[Estilos] Recibidos:', data.length, data);
                setEstilos(data);
                setError('');
            } catch (e) {
                if (axios.isCancel(e)) return; // petición cancelada
                console.error('[Estilos] Error cargando estilos:', e);
                setEstilos([]);
                setError('No se pudieron cargar los estilos del grupo');
            }
        })();

        return () => {
            controller.abort?.();
        };
    }, [grupoSel?.id]);

    // Utilidad para probar desde consola:
    useEffect(() => {
        window.testFetchEstilos = async (gid = 10) => {
            const { data } = await axios.get(`/api/estilos`, { params: { grupoId: Number(gid) } });
            console.log('testFetchEstilos ->', data);
            return data;
        };
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {error && (
                <div style={{ background: '#fee', color: '#900', padding: 8, marginBottom: 8 }}>
                    {error}
                </div>
            )}

            <GruposDeBaile
                grupos={grupos}
                grupoSeleccionadoId={grupoSel?.id || null}
                onSelectGrupo={(g) => {
                    console.log('[UI] Grupo seleccionado:', g);
                    setGrupoSel(g);
                }}
            />

            <div style={{ position: 'relative', zIndex: 10 }}>

                <ContenidoGrupos grupo={grupoSel} estilos={estilos} />
            </div>
        </div>
    );
}
