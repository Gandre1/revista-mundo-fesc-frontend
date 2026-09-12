import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { useSubmissions } from './submission-context';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';
const FESC_WINE = '#630b00';

// Tipos
interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  fileType: 'article' | 'other';
}

interface Contributor {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  afiliacion: string;
  orcid?: string;
  isPrincipal: boolean;
}

interface SubmissionData {
  // Step 1: Inicio
  idioma: 'es' | 'en';
  titulo: string;
  seccion: string;
  checklistItems: boolean[];
  consentimientoPrivacidad: boolean;
  
  // Step 2: Detalles
  tituloIngles?: string;
  palabrasClave: string;
  resumen: string;
  referencias: string;
  
  // Step 3: Archivos
  files: FileUpload[];
  
  // Step 4: Colaboradores
  colaboradores: Contributor[];
  
  // Step 5: Para editores
  comentariosEditor: string;
}

const STEPS = [
  { id: 1, name: 'Inicio', key: 'inicio' },
  { id: 2, name: 'Detalles', key: 'detalles' },
  { id: 3, name: 'Cargar archivos', key: 'archivos' },
  { id: 4, name: 'Colaboradores/as', key: 'colaboradores' },
  { id: 5, name: 'Para los editores/as', key: 'editores' },
  { id: 6, name: 'Revisión', key: 'revision' },
];

const SECCIONES = [
  'Artículos de Investigación',
  'Artículo Originales',
  'Reflexión',
  'Revisión',
  'Prácticas educativas',
  'Artículos de Revisión',
  'Artículos Originales',
  'Artículos para Reflexión',
];

const CHECKLIST_ITEMS = [
  'El envío no ha sido publicado previamente ni se ha sometido a consideración por ninguna otra revista (o se ha proporcionado una explicación al respecto en los Comentarios al editor/a).',
  'El archivo de envío está en formato Microsoft Word.',
  'Se proporcionan direcciones URL para cada una de las referencias incorporadas en el trabajo.',
  'El texto tiene un interlineado sencillo de (1), tamaño carta, en letra Times New Roman 12 justificado, con márgenes de 2,5 cm por todos los lados.',
  'El autor del artículo debe diligenciar los formatos de: Carta de originalidad, Acta de cesión de derechos, Ficha datos autores.',
  'El texto cumple con los requisitos estilísticos y bibliográficos establecidos en las Directrices del autor/a.',
];

export function SubmissionWizard() {
  const navigate = useNavigate();
  const { addSubmission, updateSubmission } = useSubmissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Contributor | null>(null);

  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    idioma: 'es',
    titulo: '',
    seccion: '',
    checklistItems: new Array(CHECKLIST_ITEMS.length).fill(false),
    consentimientoPrivacidad: false,
    palabrasClave: '',
    resumen: '',
    referencias: '',
    files: [],
    colaboradores: [],
    comentariosEditor: '',
  });

  const [newFile, setNewFile] = useState({
    name: '',
    fileType: 'article' as 'article' | 'other',
  });

  const [newCollaborator, setNewCollaborator] = useState<Contributor>({
    id: '',
    nombre: '',
    apellidos: '',
    email: '',
    pais: '',
    afiliacion: '',
    orcid: '',
    isPrincipal: false,
  });

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAddFile = () => {
    if (newFile.name) {
      const file: FileUpload = {
        id: Date.now().toString(),
        name: newFile.name,
        size: Math.floor(Math.random() * 5000000) + 100000,
        type: 'application/pdf',
        fileType: newFile.fileType,
      };
      setSubmissionData({
        ...submissionData,
        files: [...submissionData.files, file],
      });
      setNewFile({ name: '', fileType: 'article' });
      setShowFileDialog(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSubmissionData({
      ...submissionData,
      files: submissionData.files.filter(f => f.id !== id),
    });
  };

  const handleAddCollaborator = () => {
    if (newCollaborator.nombre && newCollaborator.email) {
      const collab: Contributor = {
        ...newCollaborator,
        id: Date.now().toString(),
      };
      setSubmissionData({
        ...submissionData,
        colaboradores: [...submissionData.colaboradores, collab],
      });
      setNewCollaborator({
        id: '',
        nombre: '',
        apellidos: '',
        email: '',
        pais: '',
        afiliacion: '',
        orcid: '',
        isPrincipal: false,
      });
      setShowCollaboratorDialog(false);
      setEditingCollaborator(null);
    }
  };

  const handleRemoveCollaborator = (id: string) => {
    setSubmissionData({
      ...submissionData,
      colaboradores: submissionData.colaboradores.filter(c => c.id !== id),
    });
  };

  const handleSubmit = () => {
    // Guardar y enviar
    const submissionToSave = {
      ...submissionData,
      status: 'submitted' as const,
      dateSubmitted: new Date().toISOString(),
    };
    addSubmission(submissionToSave);
    alert('¡Artículo enviado con éxito!');
    navigate('/admin/submissions');
  };

  const handleSaveForLater = () => {
    // Guardar como borrador
    const draftToSave = {
      ...submissionData,
      status: 'draft' as const,
    };
    addSubmission(draftToSave);
    alert('Borrador guardado correctamente');
    navigate('/admin/submissions');
  };

  const canProceedFromStep1 = 
    submissionData.titulo.trim() !== '' &&
    submissionData.seccion !== '' &&
    submissionData.checklistItems.every(item => item) &&
    submissionData.consentimientoPrivacidad;

  const canProceedFromStep2 = 
    submissionData.palabrasClave.trim() !== '' &&
    submissionData.resumen.trim() !== '';

  const canProceedFromStep3 = submissionData.files.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm">
            <Link to="/" className="hover:underline" style={{ color: FESC_RED }}>
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">Hacer un envío</span>
          </nav>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Hacer un envío
            </h1>
            <Link
              to="/submissions"
              className="text-sm hover:underline"
              style={{ color: FESC_RED }}
            >
              Guardar para más tarde
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Enviando a la sección <span style={{ color: FESC_RED, fontWeight: '600' }}>
              {submissionData.seccion || 'Artículo Originales'}
            </span> en <span style={{ fontWeight: '600' }}>Español</span>
            {submissionData.seccion && (
              <> · <Link to="#" className="hover:underline" style={{ color: FESC_RED }}>Cambiar</Link></>
            )}
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                      step.id < currentStep
                        ? 'text-white'
                        : step.id === currentStep
                        ? 'text-white ring-2 ring-offset-2'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    style={{
                      backgroundColor: step.id <= currentStep ? FESC_RED : undefined,
                      ringColor: step.id === currentStep ? FESC_RED : undefined,
                    }}
                  >
                    {step.id < currentStep ? <Check size={18} /> : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      step.id <= currentStep ? 'font-medium' : 'text-gray-500'
                    }`}
                    style={{
                      color: step.id <= currentStep ? FESC_GRAY : undefined,
                    }}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      step.id < currentStep ? '' : 'bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: step.id < currentStep ? FESC_RED : undefined,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* STEP 1: Inicio */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Antes de empezar
                </h2>
                <div className="prose max-w-none text-sm space-y-3 mb-6">
                  <p style={{ color: FESC_GRAY }}>
                    Gracias por enviar su trabajo a Mundo FESC. Se le pedirá que cargue archivos durante este proceso de envío, así que asegúrese de tener lo siguiente preparado:
                  </p>
                  <ul className="list-disc ml-6 space-y-2" style={{ color: FESC_GRAY }}>
                    <li>Texto completo del manuscrito en formato Word (con todos los metadatos excluidos del archivo).</li>
                    <li>Información relacionada con los colaboradores (incluidos todos los detalles de contacto para el autor del envío principal).</li>
                    <li>Formularios de Consentimiento (si es aplicable).</li>
                  </ul>
                  <p style={{ color: FESC_GRAY }}>
                    Los cuatro primeros pasos de los cinco del proceso de presentación requerirán completar todos los detalles de su artículo. Cuando complete todos los pasos, revise los detalles en la página antes de enviar el envío editorial para revisión. La información puede modificarse antes de la entrega y antes de la publicación final.
                  </p>
                  <p style={{ color: FESC_RED, fontWeight: '500' }}>
                    Una vez iniciado, el estado puede guardar su envío para su recuperación posterior y estado. Puede volver a enviar y revisar todas las formas de cumplir con los parámetros editoriales de Mundo FESC.
                  </p>
                </div>
              </div>

              {/* Idioma del envío */}
              <div>
                <label className="block text-sm mb-3" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Idioma del envío <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="text-sm mb-2" style={{ color: FESC_GRAY }}>
                  Seleccione el idioma principal del envío.
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="idioma"
                      value="en"
                      checked={submissionData.idioma === 'en'}
                      onChange={() => setSubmissionData({ ...submissionData, idioma: 'en' })}
                      className="w-4 h-4"
                      style={{ accentColor: FESC_RED }}
                    />
                    <span style={{ color: FESC_GRAY }}>Inglés</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="idioma"
                      value="es"
                      checked={submissionData.idioma === 'es'}
                      onChange={() => setSubmissionData({ ...submissionData, idioma: 'es' })}
                      className="w-4 h-4"
                      style={{ accentColor: FESC_RED }}
                    />
                    <span style={{ color: FESC_GRAY }}>Español</span>
                  </label>
                </div>
              </div>

              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Título <span style={{ color: FESC_RED }}>*</span>
                </label>
                <input
                  id="titulo"
                  type="text"
                  value={submissionData.titulo}
                  onChange={(e) => setSubmissionData({ ...submissionData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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

              {/* Sección */}
              <div>
                <label htmlFor="seccion" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Sección <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="text-sm mb-3" style={{ color: FESC_GRAY }}>
                  Los artículos deben enviarse en una de las secciones de la revista.
                </div>
                <select
                  id="seccion"
                  value={submissionData.seccion}
                  onChange={(e) => setSubmissionData({ ...submissionData, seccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                  {SECCIONES.map((seccion) => (
                    <option key={seccion} value={seccion}>
                      {seccion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de verificación */}
              <div>
                <label className="block text-sm mb-3" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Lista de verificación del envío <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="text-sm mb-4" style={{ color: FESC_GRAY }}>
                  Todos los envíos deben cumplir los siguientes requisitos.
                </div>
                <div className="space-y-3">
                  {CHECKLIST_ITEMS.map((item, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={submissionData.checklistItems[index]}
                        onChange={(e) => {
                          const newItems = [...submissionData.checklistItems];
                          newItems[index] = e.target.checked;
                          setSubmissionData({ ...submissionData, checklistItems: newItems });
                        }}
                        className="w-4 h-4 mt-0.5 rounded"
                        style={{ accentColor: FESC_RED }}
                      />
                      <span className="text-sm" style={{ color: FESC_GRAY }}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Consentimiento de privacidad */}
              <div className="border border-gray-300 rounded p-4 bg-gray-50">
                <label className="block text-sm mb-3" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Consentimiento de privacidad <span style={{ color: FESC_RED }}>*</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={submissionData.consentimientoPrivacidad}
                    onChange={(e) =>
                      setSubmissionData({ ...submissionData, consentimientoPrivacidad: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 rounded"
                    style={{ accentColor: FESC_RED }}
                  />
                  <span className="text-sm" style={{ color: FESC_GRAY }}>
                    Sí, estoy de acuerdo en que mis datos personales sean almacenados con la{' '}
                    <Link to="#" className="hover:underline" style={{ color: FESC_RED }}>
                      declaración de privacidad
                    </Link>.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Detalles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Detalles del envío
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Proporcione los detalles clave relacionados con el trabajo académico a publicar en el envío en cuestión.
                </p>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <button
                  className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                  style={{ color: FESC_RED, borderColor: FESC_RED }}
                >
                  Inglés
                </button>
                <button
                  className="px-3 py-1.5 text-sm border rounded"
                  style={{ backgroundColor: FESC_RED, color: 'white', borderColor: FESC_RED }}
                >
                  Español
                </button>
              </div>

              {/* Título (Editable) */}
              <div>
                <label htmlFor="titulo-detalle" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Título <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="titulo-detalle"
                    type="text"
                    value={submissionData.titulo}
                    onChange={(e) => setSubmissionData({ ...submissionData, titulo: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                    className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                    style={{ color: FESC_RED, borderColor: FESC_RED }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Palabras clave */}
              <div>
                <label htmlFor="palabras-clave" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Palabras clave <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="text-sm mb-2" style={{ color: FESC_GRAY }}>
                  Palabras clave que resumen su manuscrito o expresión de la clave de búsqueda que se usan para indexar las letras principales del envío.
                </div>
                <textarea
                  id="palabras-clave"
                  value={submissionData.palabrasClave}
                  onChange={(e) => setSubmissionData({ ...submissionData, palabrasClave: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none resize-none"
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

              {/* Resumen */}
              <div>
                <label htmlFor="resumen" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Resumen <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="mb-2 flex gap-2">
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    <strong>B</strong>
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    <em>I</em>
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    X₂
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    X²
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    🔗
                  </button>
                </div>
                <textarea
                  id="resumen"
                  value={submissionData.resumen}
                  onChange={(e) => setSubmissionData({ ...submissionData, resumen: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none resize-none"
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
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <AlertTriangle size={16} />
                  <span>0 de 0 palabras</span>
                </div>
              </div>

              {/* Referencias */}
              <div>
                <label htmlFor="referencias" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Referencias <span style={{ color: FESC_RED }}>*</span>
                </label>
                <div className="text-sm mb-2" style={{ color: FESC_GRAY }}>
                  Introduzca cada referencia o una línea nueva, sin formatear ni agregar ningún otro texto o utilice el formato ISO 690.
                </div>
                <textarea
                  id="referencias"
                  value={submissionData.referencias}
                  onChange={(e) => setSubmissionData({ ...submissionData, referencias: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none resize-none"
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

          {/* STEP 3: Cargar archivos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Cargar archivos
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Proporcione todos los archivos que nuestro equipo editorial necesite para evaluar su envío. Además de los datos prácticos, puede incluir envíos de datos, declaraciones de conflictos de interés u otros archivos adicionales si resultara que ayudan a nuestros editores.
                </p>
              </div>

              {/* Lista de archivos */}
              {submissionData.files.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Archivos
                  </h3>
                  {submissionData.files.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-300 rounded p-4 flex items-start justify-between bg-gray-50"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <FileText size={24} style={{ color: FESC_RED }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: FESC_GRAY }}>
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-medium" style={{ color: FESC_RED }}>
                              ¿Qué tipo de archivo es? 
                            </span>
                            <div className="flex gap-2 mt-1">
                              <button
                                className="text-xs px-2 py-1 border rounded hover:bg-white"
                                style={{ color: FESC_RED, borderColor: FESC_RED }}
                              >
                                Texto del artículo
                              </button>
                              <button
                                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-white text-gray-600"
                              >
                                Otro
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                          style={{ color: FESC_RED, borderColor: FESC_RED }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                          style={{ color: FESC_RED, borderColor: FESC_RED }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón añadir archivo */}
              {!showFileDialog ? (
                <button
                  onClick={() => setShowFileDialog(true)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  style={{ color: FESC_RED, borderColor: FESC_RED }}
                >
                  Añadir archivo
                </button>
              ) : (
                <div className="border border-gray-300 rounded p-6 bg-gray-50">
                  <h3 className="text-base mb-4" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Cargar archivo
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="file-upload" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                        Nombre del archivo <span style={{ color: FESC_RED }}>*</span>
                      </label>
                      <input
                        id="file-upload"
                        type="text"
                        value={newFile.name}
                        onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                        placeholder="Art+13.pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Haga clic para seleccionar un archivo o arrástrelo aquí
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamaño máximo: 50 MB
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddFile}
                        className="px-4 py-2 text-sm text-white rounded hover:opacity-90"
                        style={{ backgroundColor: FESC_RED }}
                      >
                        Cargar archivo
                      </button>
                      <button
                        onClick={() => {
                          setShowFileDialog(false);
                          setNewFile({ name: '', fileType: 'article' });
                        }}
                        className="px-4 py-2 text-sm border rounded hover:bg-white"
                        style={{ color: FESC_RED, borderColor: FESC_RED }}
                      >
                        Cancelar carga
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Colaboradores */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Colaboradores/as
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Añada los detalles de todos los autores/as del envío. Añada un contacto principal para nuestra correspondencia editorial relativa al envío. Los detalles de todos los editores/as registrados/as deberán ser incluidos como tal.
                </p>
              </div>

              {/* Lista de colaboradores */}
              {submissionData.colaboradores.length > 0 && (
                <div className="space-y-3 mb-6">
                  {submissionData.colaboradores.map((collab) => (
                    <div
                      key={collab.id}
                      className="border border-gray-300 rounded p-4 flex items-start justify-between bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: FESC_GRAY }}>
                            {collab.nombre} {collab.apellidos}
                          </span>
                          {collab.isPrincipal && (
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{ backgroundColor: FESC_RED, color: 'white' }}
                            >
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{collab.email}</div>
                        {collab.afiliacion && (
                          <div className="text-xs text-gray-500 mt-1">{collab.afiliacion}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                          style={{ color: FESC_RED, borderColor: FESC_RED }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemoveCollaborator(collab.id)}
                          className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                          style={{ color: FESC_RED, borderColor: FESC_RED }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón añadir colaborador */}
              {!showCollaboratorDialog ? (
                <>
                  <button
                    onClick={() => setShowCollaboratorDialog(true)}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                    style={{ color: FESC_RED, borderColor: FESC_RED }}
                  >
                    Añadir colaborador/a
                  </button>
                  <div className="text-sm mt-2" style={{ color: FESC_GRAY }}>
                    <p className="mb-2">o</p>
                    <button className="hover:underline" style={{ color: FESC_RED }}>
                      Preasignar un usuario
                    </button>
                  </div>
                </>
              ) : (
                <div className="border border-gray-300 rounded p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                      Añadir colaborador/a
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                        style={{ color: FESC_RED, borderColor: FESC_RED }}
                      >
                        Buscar
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm text-white rounded"
                        style={{ backgroundColor: FESC_RED }}
                      >
                        Preasignar
                      </button>
                      <button
                        onClick={handleAddCollaborator}
                        className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                        style={{ color: FESC_RED, borderColor: FESC_RED }}
                      >
                        Añadir colaborador/a
                      </button>
                    </div>
                  </div>

                  <div className="text-sm mb-4 text-gray-600">
                    Ningún resultado coincidió.
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                          Nombre <span style={{ color: FESC_RED }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={newCollaborator.nombre}
                          onChange={(e) => setNewCollaborator({ ...newCollaborator, nombre: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                          Apellidos
                        </label>
                        <input
                          type="text"
                          value={newCollaborator.apellidos}
                          onChange={(e) => setNewCollaborator({ ...newCollaborator, apellidos: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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

                    <div>
                      <label className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                        Correo electrónico <span style={{ color: FESC_RED }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={newCollaborator.email}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                        Afiliación
                      </label>
                      <input
                        type="text"
                        value={newCollaborator.afiliacion}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, afiliacion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                        País
                      </label>
                      <select
                        value={newCollaborator.pais}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, pais: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
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
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-principal"
                        checked={newCollaborator.isPrincipal}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, isPrincipal: e.target.checked })}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: FESC_RED }}
                      />
                      <label htmlFor="is-principal" className="text-sm" style={{ color: FESC_GRAY }}>
                        Contacto principal para correspondencia editorial
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAddCollaborator}
                      className="px-4 py-2 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: FESC_RED }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setShowCollaboratorDialog(false);
                        setNewCollaborator({
                          id: '',
                          nombre: '',
                          apellidos: '',
                          email: '',
                          pais: '',
                          afiliacion: '',
                          orcid: '',
                          isPrincipal: false,
                        });
                      }}
                      className="px-4 py-2 text-sm border rounded hover:bg-white"
                      style={{ color: FESC_RED, borderColor: FESC_RED }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Para los editores */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Para los editores/as
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Proponga los detalles importantes que el autor personal del editor/a debe comentar en un manuscrito del producto o en otros comentarios que sirvan de ayuda para nuestros editores.
                </p>
              </div>

              <div>
                <label htmlFor="comentarios-editor" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                  Comentarios para el editor/a
                </label>
                <div className="mb-2 flex gap-2">
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    <strong>B</strong>
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    <em>I</em>
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    X₂
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    X²
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                    🔗
                  </button>
                </div>
                <textarea
                  id="comentarios-editor"
                  value={submissionData.comentariosEditor}
                  onChange={(e) => setSubmissionData({ ...submissionData, comentariosEditor: e.target.value })}
                  rows={10}
                  placeholder="Cuando introduzca un comentario o suba un archivo, puede mantenerse al tanto del editorial mientras que el artículo siga un proceso en las distintas etapas del producto. Esta información puede modificar otras etapas en la publicación final."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none resize-none"
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

          {/* STEP 6: Revisión */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <p className="text-sm" style={{ color: FESC_WINE }}>
                  Hay una o más plegarias que deberá rellenar en la etapa anterior para enviar el envío. Revise la siguiente información y luego las pestañas solicitadas.
                </p>
              </div>

              <div>
                <h2 className="text-xl mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                  Revisar y enviar
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Revise la información que ha introducido antes de finalizar su envío. Puede modificar esta información a lo largo de las revisión anterior ahora antes de enviar a la sección editorial para evaluarla. Naya, mientras en su etapa debe ser modificable mediante el envío finalizando su punto antes de publicar.
                </p>
              </div>

              {/* Detalles (Inglés) */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Detalles (Inglés)
                  </h3>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Título</div>
                    <div className="text-sm text-gray-700">{submissionData.titulo || 'Ninguno proporcionado'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Palabras clave</div>
                    <div className="text-sm text-gray-700">{submissionData.palabrasClave || 'Ninguno proporcionado'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Resumen</div>
                    <div className="text-sm text-gray-700">{submissionData.resumen || 'Ninguno proporcionado'}</div>
                  </div>
                </div>
              </div>

              {/* Detalles (Español) */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Detalles (Español)
                  </h3>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Título</div>
                    <div className="text-sm text-gray-700">{submissionData.titulo}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Palabras clave</div>
                    <div className="text-sm text-gray-700">{submissionData.palabrasClave}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Resumen</div>
                    <div className="text-sm text-gray-700">{submissionData.resumen}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Referencias</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{submissionData.referencias}</div>
                  </div>
                </div>
              </div>

              {/* Archivos */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Archivos
                  </h3>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4">
                  {submissionData.files.length > 0 ? (
                    <ul className="space-y-2">
                      {submissionData.files.map((file) => (
                        <li key={file.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <FileText size={16} style={{ color: FESC_RED }} />
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                      <AlertTriangle size={18} style={{ color: FESC_RED }} />
                      <span className="text-sm" style={{ color: FESC_RED }}>
                        Debe cargar al menos un archivo tipo texto del artículo.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Colaboradores/as */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Colaboradores/as
                  </h3>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4">
                  {submissionData.colaboradores.length > 0 ? (
                    <ul className="space-y-2">
                      {submissionData.colaboradores.map((collab) => (
                        <li key={collab.id} className="text-sm text-gray-700">
                          {collab.nombre} {collab.apellidos}
                          {collab.isPrincipal && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: FESC_RED, color: 'white' }}>
                              Principal
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                      <AlertTriangle size={18} style={{ color: FESC_RED }} />
                      <span className="text-sm" style={{ color: FESC_RED }}>
                        No se han añadido colaboradores/as para este envío.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Para los editores/as (Inglés) */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Para los editores/as (Inglés)
                  </h3>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-700">Ninguno</div>
                </div>
              </div>

              {/* Para los editores/as (Español) */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
                  <h3 className="text-base" style={{ color: FESC_GRAY, fontWeight: '600' }}>
                    Para los editores/as (Español)
                  </h3>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-3 py-1.5 text-sm border rounded hover:bg-white"
                    style={{ color: FESC_RED, borderColor: FESC_RED, backgroundColor: 'white' }}
                  >
                    Editar
                  </button>
                </div>
                <div className="p-4">
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: FESC_GRAY }}>Comentarios para el editor/a</div>
                    <div className="text-sm text-gray-700">{submissionData.comentariosEditor || 'Ninguno'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Último guardado hace {Math.floor(Math.random() * 5) + 1} {Math.random() > 0.5 ? 'minutos' : 'segundos'}
            </div>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  style={{ color: FESC_RED, borderColor: FESC_RED }}
                >
                  Atrás
                </button>
              )}
              <button
                onClick={handleSaveForLater}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
              >
                Guardar para más tarde
              </button>
              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 2 && !canProceedFromStep2) ||
                    (currentStep === 3 && !canProceedFromStep3)
                  }
                  className="px-4 py-2 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: FESC_RED }}
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedFromStep3 || submissionData.colaboradores.length === 0}
                  className="px-4 py-2 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: FESC_RED }}
                >
                  Enviar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
