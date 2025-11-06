import React, { useEffect, useState } from 'react';

export default function VerifyEmail() {
    // Este componente solo muestra estado; el backend ya verifica y redirige aquí con ?ok=1
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        setOk(qs.get('ok') === '1');
    }, []);

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
            {ok ? (
                <>
                    <h1>✅ ¡Email verificado!</h1>
                    <p>Ya puedes iniciar sesión con tu cuenta.</p>
                </>
            ) : (
                <>
                    <h1>Comprueba tu correo</h1>
                    <p>
                        Te hemos enviado un email con un enlace de verificación.
                        Haz clic en él para activar tu cuenta.
                    </p>
                    <p style={{ opacity: 0.7, fontSize: 14 }}>
                        Si no lo ves, revisa la carpeta de spam.
                    </p>
                </>
            )}
        </div>
    );
}
