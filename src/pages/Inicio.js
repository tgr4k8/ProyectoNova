import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from '../components/Layout';
import GruposDeBaile from "../components/GruposDeBaile";
import CarruselEstilos from '../components/CarruselEstilos';
import CarruselProfesores from '../components/CarruselProfesores';
import Tarifas from '../components/Tarifas';
import CalendarioPersonalizado from '../components/CalendarioPersonalizado';
import ComoFunciona from '../components/ComoFunciona';
import Portada from '../components/Portada';
import Footer from '../components/Footer';




const Inicio = () => {
  const [activo, setActivo] = useState(null);
  return (
    <>


      <Portada titulo={"¿Cómo funciona?"} descripcion={"Lorem ipsum dfvlirrvkirhgrfkeolor sit amet consectetur adipisicing elit. <br/> Quia, voluptatum? Doloremque, quia, voluptatum?"} />
      <ComoFunciona />
      <div style={{ position: 'relative', zIndex: 5 }}>
        <GruposDeBaile style={{ zIndex: 1, position: 'relative' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <CarruselEstilos style={{ zIndex: 100, position: 'relative' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <CarruselProfesores style={{ zIndex: 100, position: 'relative' }} />
      </div>
      <Tarifas />
      <div
        className="conocenos"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <h2 style={{ fontWeight: 'bold' }}>¡¡Conócenos!!</h2>
        <p style={{ fontWeight: 'bold', maxWidth: '600px', textAlign: 'center' }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, voluptatum? Doloremque, quia, voluptatum?
        </p>
        <a href="/comunidad" class="btn-alert btn">Comunidad</a>

      </div>
      <h2 style={{ backgroundColor: '#ffd300', color: '#071323', height: '80px', alignItems: 'center', display: 'flex', padding: '2rem', bottom: 0, }}>¡Apúntate a nuestros eventos!</h2 >

      <CalendarioPersonalizado />



    </>
  );
};

export default Inicio;
