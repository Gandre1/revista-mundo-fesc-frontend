import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from './auth-context';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function Register() {
  const [orcidDialogOpen, setOrcidDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    afiliacion: '',
    pais: '',
    email: '',
    nombreUsuario: '',
    password: '',
    confirmPassword: '',
    consentimiento: false,
    notificaciones: false,
    revisor: false
  });
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    // Registrar usuario usando el contexto de autenticación
    const success = register({
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      nombreUsuario: formData.nombreUsuario,
      afiliacion: formData.afiliacion,
      pais: formData.pais,
      notificaciones: formData.notificaciones,
      revisor: formData.revisor,
      role: 'author'
    });
    
    if (!success) {
      setErrorMessage('Este correo electrónico ya está registrado.');
      return;
    }
    
    // Registro exitoso
    setSuccessMessage('¡Registro exitoso! Redirigiendo al inicio de sesión...');
    
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar con ISSN e idiomas */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-700">
            <span>ISSN: 2216-0353 (Impreso)</span>
            <span>E-ISSN: 2216-0388 (Electrónico)</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-700 hover:text-gray-900">🌐 ES</button>
            <button className="text-gray-700 hover:text-gray-900">EN</button>
            <Link to="/register" className="text-gray-700 hover:text-gray-900">
              Registrarse
            </Link>
            <Link 
              to="/login" 
              className="px-3 py-1 text-white hover:opacity-90"
              style={{ backgroundColor: FESC_RED }}
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>

      {/* Header principal con logo */}
      <div className="bg-white border-b-4" style={{ borderBottomColor: FESC_RED }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                Revista Mundo FESC
              </h1>
              <p className="text-sm" style={{ color: FESC_GRAY }}>
                Sistema de Gestión Editorial
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">ISSN: 2248-4000</div>
              <div className="text-xs text-gray-500">Fundación de Estudios Superiores Comfanorte</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">{/* Breadcrumb */}
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="text-sm">
              <Link to="/login" className="hover:underline" style={{ color: FESC_RED }}>
                Entrar
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">Registrarse</span>
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <h2 className="text-2xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Registrarse
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Los campos obligatorios están marcados con un asterisco. <span style={{ color: FESC_RED }}>*</span>
            </p>

            {/* Mensajes de éxito y error */}
            {successMessage && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* ORCID buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                type="button"
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50 transition-colors"
                style={{ 
                  color: FESC_RED,
                  borderColor: FESC_RED
                }}
              >
                Cree o conecte su identificador ORCID
              </button>
              <button
                type="button"
                onClick={() => setOrcidDialogOpen(true)}
                className="text-sm hover:underline"
                style={{ color: FESC_RED }}
              >
                ¿Qué es ORCID?
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección Perfil */}
              <div>
                <h2 className="text-lg mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Perfil
                </h2>
                
                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="nombre" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Nombre <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label htmlFor="apellidos" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Apellidos
                    </label>
                    <input
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Afiliación */}
                  <div>
                    <label htmlFor="afiliacion" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Afiliación <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="afiliacion"
                      name="afiliacion"
                      type="text"
                      value={formData.afiliacion}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* País */}
                  <div>
                    <label htmlFor="pais" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      País <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <select
                      id="pais"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Seleccione un país</option>
                      <option value="CO">Colombia</option>
                      <option value="AR">Argentina</option>
                      <option value="BR">Brasil</option>
                      <option value="CL">Chile</option>
                      <option value="MX">México</option>
                      <option value="PE">Perú</option>
                      <option value="ES">España</option>
                      <option value="US">Estados Unidos</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección Entrar */}
              <div>
                <h2 className="text-lg mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Entrar
                </h2>
                
                <div className="space-y-4">
                  {/* Correo electrónico */}
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Correo electrónico <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Nombre usuario */}
                  <div>
                    <label htmlFor="nombreUsuario" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Nombre usuario <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="nombreUsuario"
                      name="nombreUsuario"
                      type="text"
                      value={formData.nombreUsuario}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label htmlFor="password" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Contraseña <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Repita la contraseña */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                      Repita la contraseña <span style={{ color: FESC_RED }}>*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                      style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes de consentimiento */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <input
                    id="consentimiento"
                    name="consentimiento"
                    type="checkbox"
                    checked={formData.consentimiento}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="consentimiento" className="text-sm" style={{ color: FESC_GRAY }}>
                    Sí, consiento que mis datos se recopilen y se almacenen de acuerdo con la{' '}
                    <button 
                      type="button"
                      onClick={() => setPrivacyDialogOpen(true)}
                      className="hover:underline" 
                      style={{ color: FESC_RED }}
                    >
                      declaración de privacidad
                    </button>
                    .
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="notificaciones"
                    name="notificaciones"
                    type="checkbox"
                    checked={formData.notificaciones}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="notificaciones" className="text-sm" style={{ color: FESC_GRAY }}>
                    Sí, deseo que me notifiquen acerca de nuevas publicaciones y avisos.
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="revisor"
                    name="revisor"
                    type="checkbox"
                    checked={formData.revisor}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="revisor" className="text-sm" style={{ color: FESC_GRAY }}>
                    Sí, me gustaría que me contactaran para revisar artículos de esta revista.
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: FESC_RED,
                    fontFamily: "'Roboto', Calibri, sans-serif"
                  }}
                >
                  Registrarse
                </button>
                <Link
                  to="/login"
                  className="text-sm hover:underline"
                  style={{ color: FESC_RED }}
                >
                  Entrar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ORCID Information Dialog */}
      <Dialog open={orcidDialogOpen} onOpenChange={setOrcidDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: FESC_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              ¿Qué es ORCID?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: FESC_DARK_RED }}>
                ¿Qué es ORCID?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                ORCID es una organización independiente sin ánimo de lucro que proporciona un identificador persistente —iD ORCID— que le permite diferenciarse de otros investigadores y también es un mecanismo para conectar los resultados y actividades de su investigación con su iD. ORCID se integra en muchos sistemas utilizados por editoriales, inversores/as, instituciones y otros servicios relacionados con la investigación. Para obtener más información visite{' '}
                <a 
                  href="https://orcid.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: FESC_RED }}
                >
                  orcid.org
                </a>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: FESC_DARK_RED }}>
                ¿Cómo y por qué recolectamos iD ORCID?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Esta revista recopila su iD ORCID para que podamos [agregar propósito y distinguir entre API de Miembros y API Pública]. Cuando hace clic en el botón "Autorizar" de la ventana emergente de ORCID, le solicitaremos que comparte su iD utilizando un proceso autenticado: ya sea a través del registro de iD ORCID o, si ya lo tiene, iniciando sesión en su cuenta de ORCID y, entonces, otorgándonos permiso para obtener su iD ORCID. Hacemos esto para asegurarnos de que está correctamente identificado y de que su iD ORCID se conecta de manera segura.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                Para saber más consulte{' '}
                <a 
                  href="https://support.orcid.org/hc/en-us/articles/360006897454-What-s-so-special-about-signing-in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: FESC_RED }}
                >
                  What's so special about signing in
                </a>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Esta revista recopilará y mostrará los ID de los autores y coautores autenticados en el perfil y la página del artículo de OJS.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: FESC_DARK_RED }}>
                ¿Dónde se muestran los iD ORCID?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Para reconocer que ha utilizado su iD y que este ha sido autenticado, mostramos el ícono de iD de ORCID junto a su nombre en la página del artículo de su envío y en su perfil de usuario/a público.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Más información en{' '}
                <a 
                  href="https://support.orcid.org/hc/en-us/articles/360006973893" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: FESC_RED }}
                >
                  How should an ORCID iD be displayed
                </a>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: FESC_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Declaración de privacidad
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            <p className="text-gray-700 leading-relaxed">
              The names and email addresses entered in this journal site will be used exclusively for the stated purposes of this journal and will not be made available for any other purpose or to any other party.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}