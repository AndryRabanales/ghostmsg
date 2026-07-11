// src/app/terminos/page.jsx — Términos de uso (requeridos por las tiendas)
export const metadata = { title: "Términos de uso · GhostMsg" };

const S = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px", color: "rgba(235,235,245,0.85)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 },
  h1: { color: "#fff", fontSize: 28, fontWeight: 800 },
  h2: { color: "#c9a4ff", fontSize: 18, fontWeight: 700, marginTop: 32 },
  p: { fontSize: 14.5 },
  small: { color: "rgba(235,235,245,0.5)", fontSize: 12.5 },
};

export default function Terminos() {
  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Términos de uso</h1>
      <p style={S.small}>Última actualización: 10 de julio de 2026</p>

      <h2 style={S.h2}>1. El servicio</h2>
      <p style={S.p}>
        GhostMsg te permite recibir mensajes anónimos mediante un enlace público y
        responderlos en un chat privado que expira a las 24 horas.
      </p>

      <h2 style={S.h2}>2. Conducta permitida</h2>
      <p style={S.p}>
        Está prohibido usar GhostMsg para acosar, amenazar, difamar, suplantar
        identidades, enviar contenido sexual no solicitado, discursos de odio o
        cualquier actividad ilegal. El anonimato no exime de responsabilidad legal.
      </p>

      <h2 style={S.h2}>3. Moderación</h2>
      <p style={S.p}>
        Aplicamos filtros automáticos y herramientas de reporte y bloqueo. Podemos
        eliminar contenido o restringir el acceso de quien incumpla estos términos,
        sin previo aviso.
      </p>

      <h2 style={S.h2}>4. Tu cuenta</h2>
      <p style={S.p}>
        Debes tener al menos 17 años. Eres responsable de la actividad de tu cuenta
        y del enlace que compartes. Puedes cerrar sesión o solicitar la eliminación
        de tu cuenta cuando quieras.
      </p>

      <h2 style={S.h2}>5. Limitación de responsabilidad</h2>
      <p style={S.p}>
        El servicio se ofrece “tal cual”. No nos hacemos responsables del contenido
        que envían terceros, aunque trabajamos activamente para moderarlo. Podemos
        modificar o descontinuar funciones para mejorar el servicio.
      </p>

      <h2 style={S.h2}>6. Contacto</h2>
      <p style={S.p}>
        Preguntas sobre estos términos: <b>rabanalesandry2@gmail.com</b>
      </p>
    </main>
  );
}
