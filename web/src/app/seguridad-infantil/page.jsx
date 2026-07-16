// src/app/seguridad-infantil/page.jsx
// Estándares de seguridad infantil (CSAE) — requerido por Google Play para
// apps de categoría Social. URL pública, activa y no editable por el usuario.
export const metadata = {
  title: "Estándares de seguridad infantil · GhostMsg",
  description:
    "Política de GhostMsg contra la explotación y el abuso sexual infantil (CSAE/EASI).",
};

const S = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "48px 24px 90px", color: "rgba(235,235,245,0.86)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 },
  h1: { color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px" },
  h2: { color: "#c9a4ff", fontSize: 18, fontWeight: 700, marginTop: 34 },
  p: { fontSize: 14.5 },
  li: { fontSize: 14.5, marginBottom: 8 },
  small: { color: "rgba(235,235,245,0.5)", fontSize: 12.5 },
  b: { color: "#fff" },
};

export default function SeguridadInfantil() {
  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Estándares de seguridad infantil</h1>
      <p style={S.small}>GhostMsg · Última actualización: 15 de julio de 2026</p>

      <p style={S.p}>
        En GhostMsg tenemos una política de <b style={S.b}>tolerancia cero</b> hacia
        el material de abuso sexual infantil (CSAM) y hacia cualquier forma de
        explotación y abuso sexual infantil (CSAE/EASI). Este documento describe
        cómo prohibimos, prevenimos, detectamos y respondemos ante este tipo de
        contenido y conducta en nuestra aplicación.
      </p>

      <h2 style={S.h2}>1. Prohibición</h2>
      <p style={S.p}>
        Está terminantemente prohibido usar GhostMsg para crear, subir, compartir,
        solicitar o promover material de abuso sexual infantil, así como para
        contactar, captar (grooming), extorsionar o poner en peligro a menores de
        edad. Estas conductas violan nuestros Términos de uso y la ley.
      </p>

      <h2 style={S.h2}>2. Prevención y moderación</h2>
      <ul>
        <li style={S.li}>Filtramos automáticamente contenido de acoso y abuso grave en los mensajes.</li>
        <li style={S.li}>Los usuarios pueden <b style={S.b}>reportar</b> cualquier mensaje o conversación y <b style={S.b}>bloquear</b> a un remitente desde la propia app.</li>
        <li style={S.li}>Los reportes se revisan y el contenido que infrinja esta política se elimina.</li>
        <li style={S.li}>GhostMsg está dirigido a personas <b style={S.b}>mayores de 17 años</b>.</li>
      </ul>

      <h2 style={S.h2}>3. Cómo reportar</h2>
      <p style={S.p}>
        Cualquier persona puede reportar contenido o conducta relacionada con
        seguridad infantil de dos formas:
      </p>
      <ul>
        <li style={S.li}>Dentro de la app: mantén presionado un mensaje o usa el menú del chat para <b style={S.b}>reportar</b> o <b style={S.b}>bloquear</b>.</li>
        <li style={S.li}>Por correo, escribiendo a <b style={S.b}>rabanalesandry2@gmail.com</b> con el asunto “Seguridad infantil”.</li>
      </ul>

      <h2 style={S.h2}>4. Respuesta y cumplimiento legal</h2>
      <p style={S.p}>
        Actuamos con rapidez ante los reportes: eliminamos el contenido infractor,
        suspendemos las cuentas responsables y conservamos la evidencia necesaria.
        Cumplimos con las leyes de seguridad infantil aplicables y{" "}
        <b style={S.b}>reportamos el material de abuso sexual infantil a las
        autoridades competentes</b>, incluyendo, cuando corresponde, al Centro
        Nacional para Menores Desaparecidos y Explotados (NCMEC) u organismos
        equivalentes de la jurisdicción correspondiente.
      </p>

      <h2 style={S.h2}>5. Contacto de seguridad infantil</h2>
      <p style={S.p}>
        Persona de contacto responsable de esta política:{" "}
        <b style={S.b}>rabanalesandry2@gmail.com</b>
      </p>
    </main>
  );
}
