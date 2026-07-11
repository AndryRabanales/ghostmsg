// src/app/privacidad/page.jsx — Política de privacidad (requerida por las tiendas)
export const metadata = { title: "Política de privacidad · GhostMsg" };

const S = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px", color: "rgba(235,235,245,0.85)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 },
  h1: { color: "#fff", fontSize: 28, fontWeight: 800 },
  h2: { color: "#c9a4ff", fontSize: 18, fontWeight: 700, marginTop: 32 },
  p: { fontSize: 14.5 },
  small: { color: "rgba(235,235,245,0.5)", fontSize: 12.5 },
};

export default function Privacidad() {
  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Política de privacidad</h1>
      <p style={S.small}>Última actualización: 10 de julio de 2026</p>

      <h2 style={S.h2}>1. Quiénes somos</h2>
      <p style={S.p}>
        GhostMsg es un servicio para recibir mensajes anónimos y responderlos en un
        chat privado, disponible en la web y en la app móvil.
      </p>

      <h2 style={S.h2}>2. Datos que recopilamos</h2>
      <p style={S.p}>
        <b>Si creas una cuenta:</b> tu nombre y correo electrónico (a través de
        Google Sign-In) y, si la subes, tu foto de perfil. <b>Si envías un mensaje
        anónimo:</b> solo el contenido del mensaje y el alias opcional que escribas;
        no pedimos ni vinculamos tu identidad. <b>Si usas la app:</b> un token de
        notificaciones push para avisarte de mensajes nuevos.
      </p>

      <h2 style={S.h2}>3. Para qué usamos los datos</h2>
      <p style={S.p}>
        Únicamente para operar el servicio: mostrar tus mensajes, entregar
        notificaciones y mantener tu sesión. No vendemos tus datos ni los
        compartimos con terceros con fines publicitarios.
      </p>

      <h2 style={S.h2}>4. Conservación y eliminación</h2>
      <p style={S.p}>
        Los chats anónimos expiran y se eliminan automáticamente 24 horas después de
        su creación. Puedes borrar chats manualmente en cualquier momento. Para
        eliminar tu cuenta y todos tus datos, escríbenos al correo de contacto.
      </p>

      <h2 style={S.h2}>5. Moderación y seguridad</h2>
      <p style={S.p}>
        Filtramos automáticamente contenido de acoso grave, y ofrecemos
        herramientas para reportar mensajes y bloquear remitentes. Los reportes se
        revisan y pueden derivar en la eliminación de contenido.
      </p>

      <h2 style={S.h2}>6. Edad mínima</h2>
      <p style={S.p}>
        GhostMsg está dirigido a mayores de 17 años. No recopilamos datos de
        menores a sabiendas.
      </p>

      <h2 style={S.h2}>7. Contacto</h2>
      <p style={S.p}>
        Dudas o solicitudes de privacidad: <b>rabanalesandry2@gmail.com</b>
      </p>
    </main>
  );
}
