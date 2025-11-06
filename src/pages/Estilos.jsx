// src/pages/Estilos.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Portada from '../components/Portada';
import CarruselEstilos from '../components/CarruselEstilos';
import GruposDeBaile from '../components/GruposDeBaile';
import Footer from '../components/Footer';



function Estilos() {
    const [grupos, setGrupos] = useState([]);
    const [grupoSel, setGrupoSel] = useState(null);
    const [estilos, setEstilos] = useState([]);
    const [msg, setMsg] = useState('');

    // Cargar grupos al montar
    useEffect(() => {
        axios.get(`/api/grupos`)
            .then(res => setGrupos(Array.isArray(res.data) ? res.data : []))
            .catch(() => setGrupos([]));
    }, []);

    // Cargar estilos (todos si no hay grupo, o por grupo si hay seleccionado)
    useEffect(() => {
        const params = grupoSel?.id ? { grupoId: grupoSel.id } : {};
        axios.get(`/api/estilos`, { params })
            .then(res => {
                setEstilos(Array.isArray(res.data) ? res.data : []);
                setMsg('');
            })
            .catch(() => {
                setEstilos([]);
                setMsg('No se pudieron cargar los estilos.');
            });
    }, [grupoSel]);

    return (
        <div>
            {/* Portada opcional */}
            {/* <Portada /> */}

            <GruposDeBaile
                grupos={grupos}
                grupoSeleccionadoId={grupoSel?.id || null}
                onSelectGrupo={(g) => {
                    // console.log('[UI] Grupo seleccionado:', g);
                    setGrupoSel(g);
                }}
            />

            <div style={{ position: 'relative', zIndex: 10 }}>


                {/* Si tu carrusel necesita los estilos, pásalos como prop */}
                {/* <CarruselEstilos estilos={estilos} /> */}
                <CarruselEstilos />
            </div>
            <Footer />
        </div>
    );
}

export default Estilos;
