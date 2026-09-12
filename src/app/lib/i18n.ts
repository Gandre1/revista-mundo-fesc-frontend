// Sistema de internacionalización para Revista Mundo FESC

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navegación
  'nav.dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'nav.submissions': { es: 'Gestión de Envíos', en: 'Submissions Management' },
  'nav.mySubmissions': { es: 'Mis envíos', en: 'My Submissions' },
  'nav.assignedToMe': { es: 'Asignados a mí', en: 'Assigned to Me' },
  'nav.messaging': { es: 'Mensajería', en: 'Messaging' },
  'nav.profile': { es: 'Mi Perfil', en: 'My Profile' },
  'nav.newSubmission': { es: 'Nuevo Envío', en: 'New Submission' },
  
  // Roles
  'role.admin': { es: 'Administrador', en: 'Administrator' },
  'role.author': { es: 'Autor', en: 'Author' },
  'role.reviewer': { es: 'Revisor', en: 'Reviewer' },
  
  // Estados
  'status.new': { es: 'Nuevo', en: 'New' },
  'status.inReview': { es: 'En revisión', en: 'In Review' },
  'status.revisionsRequired': { es: 'Revisiones requeridas', en: 'Revisions Required' },
  'status.accepted': { es: 'Aceptado', en: 'Accepted' },
  'status.rejected': { es: 'Rechazado', en: 'Rejected' },
  'status.published': { es: 'Publicado', en: 'Published' },
  
  // Login
  'login.title': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.subtitle': { es: 'Revista Mundo FESC', en: 'Revista Mundo FESC' },
  'login.email': { es: 'Correo electrónico', en: 'Email' },
  'login.password': { es: 'Contraseña', en: 'Password' },
  'login.button': { es: 'Iniciar sesión', en: 'Sign in' },
  'login.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?" },
  'login.register': { es: 'Regístrate aquí', en: 'Register here' },
  'login.error': { es: 'Credenciales incorrectas', en: 'Invalid credentials' },
  'login.pageTitle': { es: 'Entrar', en: 'Login' },
  'login.usernameOrEmail': { es: 'Nombre de usuario/a o correo electrónico', en: 'Username or email' },
  'login.forgotPassword': { es: '¿Has olvidado tu contraseña?', en: 'Forgot your password?' },
  'login.rememberMe': { es: 'Mantenme conectado', en: 'Keep me logged in' },
  'login.enterButton': { es: 'Entrar', en: 'Login' },
  'login.registerLink': { es: 'Registrarse', en: 'Register' },
  'login.issn': { es: 'ISSN: 2216-0353 (Impreso)', en: 'ISSN: 2216-0353 (Print)' },
  'login.eissn': { es: 'E-ISSN: 2216-0388 (Electrónico)', en: 'E-ISSN: 2216-0388 (Electronic)' },
  'login.systemTitle': { es: 'Sistema de Gestión Editorial', en: 'Editorial Management System' },
  'login.requiredFields': { es: 'Los campos obligatorios están marcados con un asterisco.', en: 'Required fields are marked with an asterisk.' },
  'login.testCredentials': { es: 'Credenciales de prueba:', en: 'Test credentials:' },
  'login.admin': { es: 'Admin', en: 'Admin' },
  'login.author': { es: 'Autor', en: 'Author' },
  'login.reviewer': { es: 'Revisor', en: 'Reviewer' },
  'login.incorrectCredentials': { es: 'Credenciales incorrectas. Por favor, intente de nuevo.', en: 'Incorrect credentials. Please try again.' },
  'login.institution': { es: 'Fundación de Estudios Superiores Comfanorte', en: 'Comfanorte Higher Education Foundation' },
  'login.keepConnected': { es: 'Mantenme conectado', en: 'Keep me logged in' },
  
  // Register
  'register.title': { es: 'Crear Cuenta', en: 'Create Account' },
  'register.subtitle': { es: 'Únete a Revista Mundo FESC', en: 'Join Revista Mundo FESC' },
  'register.hasAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'register.login': { es: 'Inicia sesión aquí', en: 'Sign in here' },
  
  // Mensajería
  'messaging.title': { es: 'Mensajería', en: 'Messaging' },
  'messaging.newMessage': { es: 'Nuevo mensaje', en: 'New Message' },
  'messaging.inbox': { es: 'Recibidos', en: 'Inbox' },
  'messaging.sent': { es: 'Enviados', en: 'Sent' },
  'messaging.compose': { es: 'Redactar', en: 'Compose' },
  'messaging.recipient': { es: 'Destinatario', en: 'Recipient' },
  'messaging.subject': { es: 'Asunto', en: 'Subject' },
  'messaging.message': { es: 'Mensaje', en: 'Message' },
  'messaging.send': { es: 'Enviar mensaje', en: 'Send Message' },
  'messaging.cancel': { es: 'Cancelar', en: 'Cancel' },
  'messaging.search': { es: 'Buscar mensajes...', en: 'Search messages...' },
  'messaging.noInbox': { es: 'No hay mensajes recibidos', en: 'No received messages' },
  'messaging.noSent': { es: 'No hay mensajes enviados', en: 'No sent messages' },
  'messaging.back': { es: 'Volver', en: 'Back' },
  'messaging.from': { es: 'De:', en: 'From:' },
  'messaging.to': { es: 'Para:', en: 'To:' },
  'messaging.relatedTo': { es: 'Relacionado con el envío:', en: 'Related to submission:' },
  'messaging.viewSubmission': { es: 'Ver envío', en: 'View Submission' },
  
  // Dashboard
  'dashboard.welcome': { es: 'Bienvenido', en: 'Welcome' },
  'dashboard.statistics': { es: 'Estadísticas', en: 'Statistics' },
  'dashboard.totalSubmissions': { es: 'Total de Envíos', en: 'Total Submissions' },
  'dashboard.newSubmissions': { es: 'Nuevos', en: 'New' },
  'dashboard.inReview': { es: 'En Revisión', en: 'In Review' },
  'dashboard.accepted': { es: 'Aceptados', en: 'Accepted' },
  'dashboard.recentActivity': { es: 'Actividad Reciente', en: 'Recent Activity' },
  
  // Common
  'common.actions': { es: 'Acciones', en: 'Actions' },
  'common.edit': { es: 'Editar', en: 'Edit' },
  'common.delete': { es: 'Eliminar', en: 'Delete' },
  'common.view': { es: 'Ver', en: 'View' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.search': { es: 'Buscar', en: 'Search' },
  'common.filter': { es: 'Filtrar', en: 'Filter' },
  'common.all': { es: 'Todos', en: 'All' },
  'common.logout': { es: 'Cerrar Sesión', en: 'Logout' },
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.noResults': { es: 'No se encontraron resultados', en: 'No results found' },
  
  // Notifications
  'notifications.title': { es: 'Notificaciones', en: 'Notifications' },
  'notifications.markAllRead': { es: 'Marcar todas como leídas', en: 'Mark all as read' },
  'notifications.noNotifications': { es: 'No hay notificaciones', en: 'No notifications' },
  
  // Idioma
  'language.spanish': { es: 'Español', en: 'Spanish' },
  'language.english': { es: 'Inglés', en: 'English' },
  'language.select': { es: 'Seleccionar idioma', en: 'Select language' },

  // Layouts - Sidebar titles
  'layout.adminPanel': { es: 'Panel de administrador', en: 'Administrator Panel' },
  'layout.editorPanel': { es: 'Panel de editor', en: 'Editor Panel' },
  'layout.reviewerPanel': { es: 'Panel de revisor', en: 'Reviewer Panel' },
  'layout.authorPanel': { es: 'Panel de autor', en: 'Author Panel' },
  'layout.activeSession': { es: 'Sesión activa', en: 'Active Session' },
  'layout.logout': { es: 'Cerrar sesión', en: 'Logout' },

  // Menu sections
  'menu.submissions': { es: 'Envíos', en: 'Submissions' },
  'menu.settings': { es: 'Ajustes', en: 'Settings' },
  'menu.statistics': { es: 'Estadísticas', en: 'Statistics' },
  'menu.tools': { es: 'Herramientas', en: 'Tools' },
  'menu.communication': { es: 'Comunicación', en: 'Communication' },
  'menu.profile': { es: 'Perfil', en: 'Profile' },
  'menu.editorialManagement': { es: 'Gestión editorial', en: 'Editorial Management' },
  'menu.myReviews': { es: 'Mis revisiones', en: 'My Reviews' },
  'menu.myArticles': { es: 'Mis artículos', en: 'My Articles' },

  // Menu items - Submissions
  'menu.newSubmission': { es: 'Nuevo Envío', en: 'New Submission' },
  'menu.allSubmissions': { es: 'Todos los envíos', en: 'All Submissions' },
  'menu.mySubmissions': { es: 'Mis envíos', en: 'My Submissions' },
  'menu.issues': { es: 'Números', en: 'Issues' },
  'menu.doi': { es: 'DOI', en: 'DOI' },

  // Menu items - Settings
  'menu.journal': { es: 'Revista', en: 'Journal' },
  'menu.website': { es: 'Sitio web', en: 'Website' },
  'menu.workflow': { es: 'Flujo de trabajo', en: 'Workflow' },
  'menu.distribution': { es: 'Distribución', en: 'Distribution' },
  'menu.usersRoles': { es: 'Usuarios/as y roles', en: 'Users and Roles' },

  // Menu items - Statistics
  'menu.articles': { es: 'Artículos', en: 'Articles' },
  'menu.magazine': { es: 'Revista', en: 'Magazine' },
  'menu.editorialActivity': { es: 'Actividad editorial', en: 'Editorial Activity' },
  'menu.users': { es: 'Usuarios/as', en: 'Users' },
  'menu.reviewReport': { es: 'Informe de revisión', en: 'Review Report' },
  'menu.views': { es: 'Vistas', en: 'Views' },
  'menu.geographicDistribution': { es: 'Distribución geográfica', en: 'Geographic Distribution' },

  // Menu items - Tools
  'menu.administration': { es: 'Administración', en: 'Administration' },

  // Menu items - Communication
  'menu.messaging': { es: 'Mensajería', en: 'Messaging' },

  // Menu items - Profile
  'menu.myProfile': { es: 'Mi Perfil', en: 'My Profile' },
  'menu.assignedToMe': { es: 'Asignados a mí', en: 'Assigned to Me' },

  // Roles display
  'role.editor': { es: 'Editor', en: 'Editor' },
  'role.administrator': { es: 'Administrador', en: 'Administrator' },

  // Page titles
  'page.dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'page.editorialManagement': { es: 'Gestión Editorial', en: 'Editorial Management' },
  'page.statistics': { es: 'Estadísticas', en: 'Statistics' },
  'page.messaging': { es: 'Mensajería', en: 'Messaging' },
  'page.myProfile': { es: 'Mi Perfil', en: 'My Profile' },
  'page.myReviews': { es: 'Mis Revisiones', en: 'My Reviews' },
  'page.mySubmissions': { es: 'Mis Envíos', en: 'My Submissions' },
};

class I18nService {
  private currentLanguage: Language = 'es';
  private LANGUAGE_KEY = 'fesc_language';

  constructor() {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem(this.LANGUAGE_KEY) as Language;
    if (savedLang === 'es' || savedLang === 'en') {
      this.currentLanguage = savedLang;
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem(this.LANGUAGE_KEY, lang);
    // Disparar evento personalizado para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }

  t(key: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage];
  }

  // Traducir con variables
  tWith(key: string, vars: Record<string, string>): string {
    let text = this.t(key);
    Object.keys(vars).forEach(varKey => {
      text = text.replace(`{${varKey}}`, vars[varKey]);
    });
    return text;
  }
}

export const i18n = new I18nService();