import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Check, Upload, X, FileText, Plus, Trash2, Save } from 'lucide-react';
import { storage, Author } from '../lib/storage';
import { useAuth } from './auth-context';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

const STEPS = [
  { id: 1, name: 'Inicio' },
  { id: 2, name: 'Detalles' },
  { id: 3, name: 'Cargar archivos' },
  { id: 4, name: 'Colaboradores/as' },
  { id: 5, name: 'Para editores/as' },
  { id: 6, name: 'Revisión' },
];

const SECCIONES = [
  'Artículos de Investigación',
  'Artículos Originales',
  'Artículos de Revisión',
  'Reflexión',
  'Prácticas educativas',
];

export function SubmissionWizardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Redirigir al login si no hay usuario
  useEffect(() => {
    if (!user) {
      alert('Debe iniciar sesión para enviar un artículo');
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    titulo: '',
    seccion: '',
    idioma: 'Español',
    resumen: '',
    palabrasClave: [] as string[],
    autores: [] as Author[],
    archivos: [] as { nombre: string; tamano: number; tipo?: string }[],
    checklistItems: {
      noPublicado: false,
      formatoWord: false,
      urlsReferencias: false,
      formato: false,
      formatosAdicionales: false,
      requisitosEstilisticos: false,
    },
    consentimientoPrivacidad: false,
    comentariosEditor: '',
    referencias: '',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [showFileTypeDialog, setShowFileTypeDialog] = useState(false);
  const [tempFile, setTempFile] = useState<{ nombre: string; tamano: number } | null>(null);
  const [currentAuthor, setCurrentAuthor] = useState<Author>({
    nombre: '',
    apellidos: '',
    email: '',
    afiliacion: '',
    pais: '',
    esCorresponsal: false,
  });

  // Cargar borrador si existe
  useEffect(() => {
    const draft = storage.getDraft();
    if (draft && draft.titulo) {
      if (confirm('Se encontró un borrador guardado. ¿Desea continuar con él?')) {
        setFormData({
          titulo: draft.titulo || '',
          seccion: draft.seccion || '',
          idioma: draft.idioma || 'Español',
          resumen: draft.resumen || '',
          palabrasClave: draft.palabrasClave || [],
          autores: draft.autores || [],
          archivos: draft.archivos || [],
          checklistItems: draft.checklistItems || {
            noPublicado: false,
            formatoWord: false,
            urlsReferencias: false,
            formato: false,
            formatosAdicionales: false,
            requisitosEstilisticos: false,
          },
          consentimientoPrivacidad: draft.consentimientoPrivacidad || false,
          comentariosEditor: draft.comentariosEditor || '',
          referencias: draft.referencias || '',
        });
      }
    }
  }, []);

  // Guardar borrador automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.titulo) {
        storage.saveDraft(formData);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && formData.palabrasClave.length < 10) {
      setFormData({
        ...formData,
        palabrasClave: [...formData.palabrasClave, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      palabrasClave: formData.palabrasClave.filter((_, i) => i !== index)
    });
  };

  const handleAddAuthor = () => {
    if (currentAuthor.nombre && currentAuthor.email) {
      setFormData({
        ...formData,
        autores: [...formData.autores, { ...currentAuthor }]
      });
      setCurrentAuthor({
        nombre: '',
        apellidos: '',
        email: '',
        afiliacion: '',
        pais: '',
        esCorresponsal: false,
      });
      setShowAuthorDialog(false);
    }
  };

  const removeAuthor = (index: number) => {
    setFormData({
      ...formData,
      autores: formData.autores.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamaño máximo (20 MB)
      if (file.size > 20 * 1024 * 1024) {
        alert('El archivo excede el tamaño máximo de 20 MB');
        return;
      }
      // Guardar archivo temporal y mostrar diálogo de tipo
      setTempFile({
        nombre: file.name,
        tamano: file.size
      });
      setShowFileTypeDialog(true);
    }
    // Limpiar el input para permitir subir el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleFileTypeSelect = (tipo: string) => {
    if (tempFile) {
      setFormData({
        ...formData,
        archivos: [...formData.archivos, {
          nombre: tempFile.nombre,
          tamano: tempFile.tamano,
          tipo
        }]
      });
      setTempFile(null);
    }
    setShowFileTypeDialog(false);
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      archivos: formData.archivos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (!user) return;

    setSaving(true);

    const newSubmission = {
      id: storage.generateSubmissionId(),
      titulo: formData.titulo,
      resumen: formData.resumen,
      palabrasClave: formData.palabrasClave,
      seccion: formData.seccion,
      idioma: formData.idioma,
      autores: formData.autores,
      archivos: formData.archivos.map(archivo => ({
        nombre: archivo.nombre,
        tamano: archivo.tamano,
        tipo: archivo.tipo,
        fecha: new Date().toISOString().split('T')[0]
      })),
      estado: 'Nuevo' as const,
      fechaEnvio: new Date().toISOString(),
      autorId: user.id,
      autorNombre: `${user.nombre} ${user.apellidos || ''}`.trim(),
      comentarios: []
    };

    storage.addSubmission(newSubmission);
    storage.clearDraft();

    // Guardar ID para mostrarlo en la página de éxito
    localStorage.setItem('lastSubmissionId', newSubmission.id);

    setSaving(false);

    // Redirigir a página de éxito
    navigate('/submission/success');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        const allChecked = Object.values(formData.checklistItems).every(v => v === true);
        return formData.titulo && formData.seccion && formData.idioma && allChecked && formData.consentimientoPrivacidad;
      case 2:
        return formData.resumen && formData.palabrasClave.length > 0 && formData.referencias;
      case 3:
        return formData.archivos.length > 0 && formData.archivos.every(a => a.tipo);
      case 4:
        return formData.autores.length > 0;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep > step.id
                      ? 'text-white'
                      : currentStep === step.id
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  style={{
                    backgroundColor: currentStep >= step.id ? FESC_RED : undefined
                  }}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-2 text-center" style={{ color: currentStep === step.id ? FESC_RED : FESC_GRAY }}>
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className="flex-1 h-1 mx-2"
                  style={{
                    backgroundColor: currentStep > step.id ? FESC_RED : '#e5e7eb'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Step 1: Inicio */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Hacer un envío
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Antes de empezar</h3>
              <p className="text-sm text-gray-700 mb-2">
                Gracias por su envío a Mundo FESC Journal. Se le pedirá que cargue archivos, identifique coautores y proporcione información como el título y el resumen.
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Lea nuestras directrices de envío si aún no lo ha hecho. Cuando rellene los formularios, proporcione todos los detalles posibles para ayudar a nuestros editores/as a evaluar su trabajo.
              </p>
              <p className="text-sm text-gray-700">
                Una vez iniciado, podrá guardar el envío y recuperarlo más tarde, así como revisar y corregir cualquier información antes de remitirlo.
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                Idioma del envío <span style={{ color: FESC_RED }}>*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">Seleccione el idioma principal del envío.</p>
              <select
                value={formData.idioma}
                onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
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
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Portugués">Portugués</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                Título <span style={{ color: FESC_RED }}>*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Ingrese el título completo del artículo"
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

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                Sección <span style={{ color: FESC_RED }}>*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">Los artículos deben enviarse a una de las secciones de la revista.</p>
              <select
                value={formData.seccion}
                onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
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
                <option value="">Seleccione una sección</option>
                {SECCIONES.map(seccion => (
                  <option key={seccion} value={seccion}>{seccion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Lista de verificación del envío <span style={{ color: FESC_RED }}>*</span>
              </label>
              <p className="text-xs text-gray-600 mb-3">Todos los envíos deben cumplir los siguientes requisitos.</p>
              <div className="space-y-3 bg-gray-50 p-4 rounded">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check1"
                    checked={formData.checklistItems.noPublicado}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, noPublicado: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check1" className="text-sm text-gray-700">
                    El envío no ha sido publicado previamente ni se ha sometido a consideración por ninguna otra revista (o se ha proporcionado una explicación al respecto en los Comentarios al editor/a).
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check2"
                    checked={formData.checklistItems.formatoWord}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, formatoWord: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check2" className="text-sm text-gray-700">
                    El archivo de envío está en formato Microsoft Word.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check3"
                    checked={formData.checklistItems.urlsReferencias}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, urlsReferencias: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check3" className="text-sm text-gray-700">
                    Se proporcionan direcciones URL para cada una de las referencias incorporadas en el trabajo.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check4"
                    checked={formData.checklistItems.formato}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, formato: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check4" className="text-sm text-gray-700">
                    El texto tiene un interlineado sencillo de (1), tamaño carta, en letra Times New Roman 12 justificado, con márgenes de 2,5 cm por todos los lados. Todas las figuras y tablas se encuentran colocadas en los lugares del texto apropiados.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check5"
                    checked={formData.checklistItems.formatosAdicionales}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, formatosAdicionales: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check5" className="text-sm text-gray-700">
                    El autor del artículo debe diligenciar los formatos de: Carta de originalidad, Acta de cesión de derechos, Ficha datos autores.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check6"
                    checked={formData.checklistItems.requisitosEstilisticos}
                    onChange={(e) => setFormData({
                      ...formData,
                      checklistItems: { ...formData.checklistItems, requisitosEstilisticos: e.target.checked }
                    })}
                    className="mt-1"
                    style={{ accentColor: FESC_RED }}
                  />
                  <label htmlFor="check6" className="text-sm text-gray-700">
                    El texto cumple con los requisitos estilísticos y bibliográficos establecidos en las Directrices del autor/a, que aparecen en la sección Envíos de la revista.
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Consentimiento de privacidad <span style={{ color: FESC_RED }}>*</span>
              </label>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={formData.consentimientoPrivacidad}
                  onChange={(e) => setFormData({ ...formData, consentimientoPrivacidad: e.target.checked })}
                  className="mt-1"
                  style={{ accentColor: FESC_RED }}
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  Sí, consiento que mis datos se recopilen y se almacenen de acuerdo con la declaración de privacidad.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Detalles */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Detalles del envío
            </h2>
            <p className="text-sm text-gray-600">
              Proporcione los detalles siguientes para ayudarnos a gestionar su envío en nuestro sistema.
            </p>

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Título <span style={{ color: FESC_RED }}>*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Ingrese el título completo del artículo"
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

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Palabras clave <span style={{ color: FESC_RED }}>*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Las palabras clave normalmente son expresiones de una a tres palabras que se usan para indicar los temas principales del envío.
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                  placeholder="Escriba una palabra clave y presione Enter"
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
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 text-white rounded hover:opacity-90"
                  style={{ backgroundColor: FESC_RED }}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.palabrasClave.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}
                  >
                    {keyword}
                    <button onClick={() => removeKeyword(index)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Seleccionado: {formData.palabrasClave.length > 0 ? formData.palabrasClave.join(', ') : 'Ninguno'}
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Resumen <span style={{ color: FESC_RED }}>*</span>
              </label>
              <textarea
                value={formData.resumen}
                onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Escriba el resumen del artículo (máximo 250 palabras)"
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

            <div>
              <label className="block text-sm mb-2 font-semibold" style={{ color: FESC_GRAY }}>
                Referencias <span style={{ color: FESC_RED }}>*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Introduzca cada referencia en una línea nueva, así podrán ser extraídas y registradas por separado.
              </p>
              <textarea
                value={formData.referencias}
                onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Ingrese las referencias bibliográficas, una por línea"
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
        )}

        {/* Step 3: Cargar archivos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Cargar archivos
            </h2>
            <p className="text-sm text-gray-600">
              Proporcione todos los archivos que nuestro equipo editorial necesite para evaluar su envío. Puede subir múltiples archivos de diferentes tipos.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Tipos de archivos que puede enviar:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Texto del artículo:</strong> Manuscrito principal en Word o PDF</li>
                <li>• <strong>Figuras/Imágenes:</strong> Gráficos, fotografías, diagramas (JPG, PNG, TIFF)</li>
                <li>• <strong>Tablas suplementarias:</strong> Datos tabulados adicionales</li>
                <li>• <strong>Material suplementario:</strong> Anexos, apéndices, videos</li>
                <li>• <strong>Conjunto de datos:</strong> Datos de investigación en Excel, CSV, etc.</li>
                <li>• <strong>Declaraciones:</strong> Conflictos de interés, permisos, consentimientos</li>
                <li>• <strong>Cartas:</strong> Carta de presentación para el editor</li>
              </ul>
            </div>

            {/* Botón de carga */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Cargue todos los archivos necesarios para evaluar su envío
              </p>
              <label className="inline-block px-6 py-3 text-white rounded hover:opacity-90 cursor-pointer" style={{ backgroundColor: FESC_RED }}>
                <Plus className="w-5 h-5 inline mr-2" />
                Agregar archivo
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.tiff,.xlsx,.xls,.csv,.zip,.rar"
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formatos aceptados: DOC, DOCX, PDF, JPG, PNG, TIFF, XLSX, XLS, CSV, ZIP, RAR (máx. 20 MB por archivo)
              </p>
            </div>

            {/* Lista de archivos */}
            {formData.archivos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold" style={{ color: FESC_GRAY }}>
                  Archivos cargados ({formData.archivos.length})
                </h3>
                {formData.archivos.map((archivo, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded bg-white">
                    <FileText className="w-10 h-10 flex-shrink-0" style={{ color: FESC_RED }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {archivo.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(archivo.tamano / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {archivo.tipo && (
                        <p className="text-sm mt-1 font-medium" style={{ color: FESC_RED }}>
                          Tipo: {archivo.tipo}
                        </p>
                      )}
                      {!archivo.tipo && (
                        <p className="text-sm mt-1 text-yellow-700">
                          ⚠️ Debe seleccionar el tipo de archivo
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!archivo.tipo && (
                        <button
                          onClick={() => {
                            setTempFile({ nombre: archivo.nombre, tamano: archivo.tamano });
                            removeFile(index);
                            setShowFileTypeDialog(true);
                          }}
                          className="text-xs px-3 py-1 border rounded hover:bg-gray-50 whitespace-nowrap"
                          style={{ borderColor: FESC_RED, color: FESC_RED }}
                        >
                          Seleccionar tipo
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 hover:bg-red-50 rounded"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.archivos.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded">
                <p className="text-gray-500">No se han cargado archivos aún</p>
                <p className="text-sm text-gray-400 mt-1">Debe cargar al menos el manuscrito principal</p>
              </div>
            )}

            {formData.archivos.some(a => !a.tipo) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atención:</strong> Todos los archivos deben tener un tipo asignado antes de continuar.
                </p>
              </div>
            )}

            {/* File Type Dialog */}
            {showFileTypeDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: FESC_GRAY }}>
                    ¿Qué tipo de archivo es?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Seleccione la categoría que mejor describa este archivo.
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {[
                      'Texto del artículo',
                      'Figura/Imagen',
                      'Tabla suplementaria',
                      'Material suplementario',
                      'Conjunto de datos',
                      'Instrumento de investigación',
                      'Materiales de investigación',
                      'Resultados de la investigación',
                      'Transcripciones',
                      'Análisis de datos',
                      'Declaración de conflictos de interés',
                      'Carta de presentación',
                      'Permisos y consentimientos',
                      'Otro'
                    ].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => handleFileTypeSelect(tipo)}
                        className="w-full text-left px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowFileTypeDialog(false);
                      setTempFile(null);
                    }}
                    className="w-full mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Colaboradores/as */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Colaboradores/as
            </h2>
            <p className="text-sm text-gray-600">
              Añada los detalles de todos los colaboradores/as de este envío. Los colaboradores/as que añada aquí recibirán un correo electrónico de confirmación del envío, así como una copia de todas las decisiones editoriales registradas relacionadas con este envío.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700">
                Si un colaborador/a no quiere ser contactado por correo electrónico, ya sea porque quiere permanecer anónimo o porque no tiene una cuenta de correo, no introduzca una dirección de correo electrónico falsa. Puede añadir información sobre este colaborador/a en un mensaje para el editor/a en el último paso del proceso de envío.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: FESC_GRAY }}>
                Lista de Colaboradores/as
              </h3>
              <button
                onClick={() => setShowAuthorDialog(true)}
                className="px-4 py-2 text-white rounded hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: FESC_RED }}
              >
                <Plus className="w-5 h-5" />
                Añadir colaborador/a
              </button>
            </div>

            {formData.autores.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500">Ningún elemento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.autores.map((autor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: FESC_GRAY }}>
                        {autor.nombre} {autor.apellidos}
                        {autor.esCorresponsal && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}>
                            Corresponsal
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{autor.email}</p>
                      <p className="text-sm text-gray-500">{autor.afiliacion} - {autor.pais}</p>
                    </div>
                    <button
                      onClick={() => removeAuthor(index)}
                      className="p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Author Dialog */}
            {showAuthorDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: FESC_GRAY }}>
                    Añadir colaborador/a
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1" style={{ color: FESC_GRAY }}>
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={currentAuthor.nombre}
                          onChange={(e) => setCurrentAuthor({ ...currentAuthor, nombre: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1"
                          onFocus={(e) => e.currentTarget.style.borderColor = FESC_RED}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: FESC_GRAY }}>
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          value={currentAuthor.apellidos}
                          onChange={(e) => setCurrentAuthor({ ...currentAuthor, apellidos: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1"
                          onFocus={(e) => e.currentTarget.style.borderColor = FESC_RED}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1" style={{ color: FESC_GRAY }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={currentAuthor.email}
                        onChange={(e) => setCurrentAuthor({ ...currentAuthor, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1"
                        onFocus={(e) => e.currentTarget.style.borderColor = FESC_RED}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1" style={{ color: FESC_GRAY }}>
                        Afiliación *
                      </label>
                      <p className="text-xs text-gray-500 mb-1">
                        La afiliación es la institución u organización a la que pertenece el colaborador/a (ej: Universidad Nacional de Colombia, Instituto de Investigaciones Científicas)
                      </p>
                      <input
                        type="text"
                        value={currentAuthor.afiliacion}
                        onChange={(e) => setCurrentAuthor({ ...currentAuthor, afiliacion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1"
                        placeholder="Ej: Fundación de Estudios Superiores Comfanorte"
                        onFocus={(e) => e.currentTarget.style.borderColor = FESC_RED}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1" style={{ color: FESC_GRAY }}>
                        País *
                      </label>
                      <input
                        type="text"
                        value={currentAuthor.pais}
                        onChange={(e) => setCurrentAuthor({ ...currentAuthor, pais: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1"
                        placeholder="Ej: Colombia"
                        onFocus={(e) => e.currentTarget.style.borderColor = FESC_RED}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="corresponsal"
                        checked={currentAuthor.esCorresponsal}
                        onChange={(e) => setCurrentAuthor({ ...currentAuthor, esCorresponsal: e.target.checked })}
                        style={{ accentColor: FESC_RED }}
                      />
                      <label htmlFor="corresponsal" className="text-sm" style={{ color: FESC_GRAY }}>
                        Autor corresponsal
                      </label>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-gray-700">
                        <strong>Nota:</strong> El autor corresponsal es la persona principal de contacto para el artículo y recibirá todas las comunicaciones editoriales.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAuthorDialog(false);
                        setCurrentAuthor({
                          nombre: '',
                          apellidos: '',
                          email: '',
                          afiliacion: '',
                          pais: '',
                          esCorresponsal: false,
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddAuthor}
                      className="px-4 py-2 text-white rounded hover:opacity-90"
                      style={{ backgroundColor: FESC_RED }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Para editores/as */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Para los editores/as
            </h2>
            <p className="text-sm text-gray-600">
              Proporcione los detalles siguientes para ayudar a nuestro equipo editorial a gestionar su envío.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700">
                Cuando introduzca los metadatos, facilite las entradas que considere más útiles para la persona que gestione su envío. Esta información puede modificarse antes de la publicación.
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                Comentarios para el editor/a
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Añada la información que considere que nuestro personal editorial debería conocer en el momento de evaluar su envío.
              </p>
              <textarea
                value={formData.comentariosEditor}
                onChange={(e) => setFormData({ ...formData, comentariosEditor: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Escriba aquí cualquier comentario o aclaración para los editores/as..."
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
        )}

        {/* Step 6: Revisión */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: FESC_GRAY }}>
              Revisar y enviar
            </h2>
            <p className="text-sm text-gray-600">
              Por favor revise toda la información antes de enviar. Una vez enviado, el artículo entrará en el proceso de revisión editorial.
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Idioma</h3>
                <p className="text-gray-700">{formData.idioma}</p>
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Título</h3>
                <p className="text-gray-700">{formData.titulo}</p>
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Sección</h3>
                <p className="text-gray-700">{formData.seccion}</p>
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Palabras Clave</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.palabrasClave.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Resumen</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.resumen}</p>
              </div>

              {formData.referencias && (
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Referencias</h3>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{formData.referencias}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-3" style={{ color: FESC_GRAY }}>
                  Archivos ({formData.archivos.length})
                </h3>
                {formData.archivos.length > 0 ? (
                  <div className="space-y-2">
                    {formData.archivos.map((archivo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <FileText className="w-6 h-6 flex-shrink-0" style={{ color: FESC_RED }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium truncate">{archivo.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {archivo.tipo} • {(archivo.tamano / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin archivos</p>
                )}
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Colaboradores/as ({formData.autores.length})</h3>
                <div className="space-y-2">
                  {formData.autores.map((autor, index) => (
                    <div key={index} className="text-gray-700">
                      <p className="font-medium">
                        {autor.nombre} {autor.apellidos}
                        {autor.esCorresponsal && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}>
                            Corresponsal
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{autor.email}</p>
                      <p className="text-sm text-gray-500">{autor.afiliacion} - {autor.pais}</p>
                    </div>
                  ))}
                </div>
              </div>

              {formData.comentariosEditor && (
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold mb-2" style={{ color: FESC_GRAY }}>Comentarios para el editor/a</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.comentariosEditor}</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-sm text-green-800">
                <strong>¿Listo para enviar?</strong> Al hacer clic en "Enviar Artículo", su trabajo será enviado al equipo editorial de Mundo FESC para su revisión. Recibirá un correo de confirmación con el número de referencia de su envío.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                storage.saveDraft(formData);
                alert('Borrador guardado exitosamente');
              }}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
              style={{ borderColor: FESC_RED, color: FESC_RED }}
            >
              <Save className="w-5 h-5" />
              Guardar Borrador
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: FESC_RED }}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: FESC_RED }}
              >
                {saving ? 'Enviando...' : 'Enviar Artículo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
