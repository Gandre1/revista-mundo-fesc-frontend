// Sistema de almacenamiento centralizado con localStorage

export interface User {
  id: string;
  email: string;
  password: string;
  role: "admin" | "author" | "editor" | "reviewer";
  nombre: string;
  apellidos?: string;
  afiliacion?: string;
  pais?: string;
  orcid?: string;
  nombreUsuario: string;
  notificaciones?: boolean;
  revisor?: boolean;
}

export interface Author {
  nombre: string;
  apellidos: string;
  email: string;
  afiliacion: string;
  pais: string;
  orcid?: string;
  esCorresponsal: boolean;
}

export interface Submission {
  id: string;
  titulo: string;
  resumen: string;
  palabrasClave: string[];
  seccion: string;
  idioma: string;
  autores: Author[];
  archivo?: {
    nombre: string;
    tamano: number;
    fecha: string;
  };
  estado:
    | "Nuevo"
    | "En revisión"
    | "Revisiones requeridas"
    | "Aceptado"
    | "Rechazado"
    | "Publicado";
  fechaEnvio: string;
  autorId: string;
  autorNombre: string;
  editorAsignado?: string;
  comentarios: Comment[];
  borrador?: boolean;
}

export interface Comment {
  id: string;
  texto: string;
  autor: string;
  fecha: string;
  tipo: "interno" | "revision" | "autor";
}

export interface Notification {
  id: string;
  tipo: "info" | "success" | "warning" | "danger";
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  submissionId?: string;
}

export interface Message {
  id: string;
  asunto: string;
  contenido: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioNombre: string;
  fecha: string;
  leido: boolean;
  submissionId?: string;
  archivoAdjunto?: {
    nombre: string;
    tamano: number;
  };
}

class StorageService {
  private USERS_KEY = "fesc_users";
  private SUBMISSIONS_KEY = "fesc_submissions";
  private NOTIFICATIONS_KEY = "fesc_notifications";
  private CURRENT_USER_KEY = "fesc_current_user";
  private DRAFTS_KEY = "fesc_drafts";
  private MESSAGES_KEY = "fesc_messages";

  // Inicializar datos por defecto
  init() {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultUsers: User[] = [
        {
          id: "1",
          email: "admin@fesc.edu.co",
          password: "admin123",
          role: "admin",
          nombre: "Administrador",
          apellidos: "FESC",
          nombreUsuario: "admin",
          afiliacion: "FESC",
          pais: "CO",
        },
        {
          id: "2",
          email: "usuario@fesc.edu.co",
          password: "usuario123",
          role: "author",
          nombre: "María",
          apellidos: "García Rodríguez",
          nombreUsuario: "mgarcia",
          afiliacion: "Universidad Nacional de Colombia",
          pais: "CO",
        },
        {
          id: "3",
          email: "editor@fesc.edu.co",
          password: "editor123",
          role: "editor",
          nombre: "Laura",
          apellidos: "Jiménez Pérez",
          nombreUsuario: "ljimenez",
          afiliacion: "FESC",
          pais: "CO",
        },
        {
          id: "4",
          email: "revisor@fesc.edu.co",
          password: "revisor123",
          role: "reviewer",
          nombre: "Carlos",
          apellidos: "Martínez López",
          nombreUsuario: "cmartinez",
          afiliacion: "Universidad de los Andes",
          pais: "CO",
          revisor: true,
        },
      ];
      this.saveUsers(defaultUsers);
    }

    if (!localStorage.getItem(this.SUBMISSIONS_KEY)) {
      const defaultSubmissions: Submission[] = [
        {
          id: "SUB-2024-001",
          titulo:
            "Impacto de la inteligencia artificial en la educación superior colombiana",
          resumen:
            "Este estudio analiza cómo la implementación de herramientas de IA está transformando los procesos de enseñanza-aprendizaje en universidades colombianas...",
          palabrasClave: [
            "Inteligencia Artificial",
            "Educación Superior",
            "Innovación Pedagógica",
          ],
          seccion: "Artículos de Investigación",
          idioma: "Español",
          autores: [
            {
              nombre: "María",
              apellidos: "García Rodríguez",
              email: "usuario@fesc.edu.co",
              afiliacion: "Universidad Nacional de Colombia",
              pais: "Colombia",
              esCorresponsal: true,
            },
          ],
          archivo: {
            nombre: "articulo_ia_educacion.docx",
            tamano: 2456789,
            fecha: "2024-03-15",
          },
          estado: "En revisión",
          fechaEnvio: "2024-03-15T10:30:00",
          autorId: "2",
          autorNombre: "María García Rodríguez",
          editorAsignado: "Dr. Pedro Sánchez",
          comentarios: [
            {
              id: "c1",
              texto:
                "Excelente propuesta metodológica. Considerar ampliar la sección de resultados.",
              autor: "Dr. Pedro Sánchez",
              fecha: "2024-03-18T14:20:00",
              tipo: "revision",
            },
          ],
        },
        {
          id: "SUB-2024-002",
          titulo:
            "Sostenibilidad empresarial en el sector cafetero del Norte de Santander",
          resumen:
            "Análisis comparativo de prácticas sostenibles implementadas en cooperativas cafeteras...",
          palabrasClave: [
            "Sostenibilidad",
            "Café",
            "Norte de Santander",
          ],
          seccion: "Artículos de Investigación",
          idioma: "Español",
          autores: [
            {
              nombre: "Carlos",
              apellidos: "Martínez López",
              email: "revisor@fesc.edu.co",
              afiliacion: "Universidad de los Andes",
              pais: "Colombia",
              esCorresponsal: true,
            },
          ],
          archivo: {
            nombre: "sostenibilidad_cafe.pdf",
            tamano: 1850000,
            fecha: "2024-03-10",
          },
          estado: "Nuevo",
          fechaEnvio: "2024-03-10T09:15:00",
          autorId: "3",
          autorNombre: "Carlos Martínez López",
          comentarios: [],
        },
      ];
      this.saveSubmissions(defaultSubmissions);
    }

    // Inicializar mensajes de ejemplo
    if (!localStorage.getItem(this.MESSAGES_KEY)) {
      const defaultMessages: Message[] = [
        {
          id: "msg-001",
          asunto:
            "Consulta sobre revisión del artículo SUB-2024-001",
          contenido:
            'Estimado editor,\n\nMe gustaría saber el estado actual de mi artículo "Impacto de la inteligencia artificial en la educación superior colombiana". ¿Ha sido asignado ya a revisores?\n\nQuedo atento a sus comentarios.\n\nSaludos cordiales,\nMaría García',
          remitenteId: "2",
          remitenteNombre: "María García Rodríguez",
          destinatarioId: "1",
          destinatarioNombre: "Administrador FESC",
          fecha: "2024-04-10T10:30:00",
          leido: false,
          submissionId: "SUB-2024-001",
        },
        {
          id: "msg-002",
          asunto:
            "Re: Consulta sobre revisión del artículo SUB-2024-001",
          contenido:
            "Estimada María,\n\nGracias por su mensaje. Su artículo ha sido asignado al Dr. Pedro Sánchez para revisión. El proceso de evaluación tomará aproximadamente 2-3 semanas.\n\nLe mantendremos informada sobre cualquier avance.\n\nCordialmente,\nEquipo Editorial",
          remitenteId: "1",
          remitenteNombre: "Administrador FESC",
          destinatarioId: "2",
          destinatarioNombre: "María García Rodríguez",
          fecha: "2024-04-10T14:20:00",
          leido: true,
          submissionId: "SUB-2024-001",
        },
        {
          id: "msg-003",
          asunto: "Asignación de revisión - SUB-2024-002",
          contenido:
            'Estimado revisor,\n\nHemos asignado a usted la revisión del artículo "Sostenibilidad empresarial en el sector cafetero del Norte de Santander".\n\nPor favor, acceda al sistema para revisar el documento y enviar sus comentarios en las próximas dos semanas.\n\nGracias por su colaboración.\n\nSaludos,\nEquipo Editorial',
          remitenteId: "1",
          remitenteNombre: "Administrador FESC",
          destinatarioId: "3",
          destinatarioNombre: "Carlos Martínez López",
          fecha: "2024-04-12T09:00:00",
          leido: false,
          submissionId: "SUB-2024-002",
        },
      ];
      this.saveMessages(defaultMessages);
    }
  }

  // USERS
  getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getUserByCredentials(
    email: string,
    password: string,
  ): User | null {
    const users = this.getUsers();
    return (
      users.find(
        (u) => u.email === email && u.password === password,
      ) || null
    );
  }

  addUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  // CURRENT USER
  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(
        this.CURRENT_USER_KEY,
        JSON.stringify(user),
      );
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  // SUBMISSIONS
  getSubmissions(): Submission[] {
    const data = localStorage.getItem(this.SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveSubmissions(submissions: Submission[]) {
    localStorage.setItem(
      this.SUBMISSIONS_KEY,
      JSON.stringify(submissions),
    );
  }

  getSubmissionById(id: string): Submission | null {
    const submissions = this.getSubmissions();
    return submissions.find((s) => s.id === id) || null;
  }

  addSubmission(submission: Submission) {
    const submissions = this.getSubmissions();
    submissions.push(submission);
    this.saveSubmissions(submissions);

    // Crear notificación para admins
    this.addNotification({
      id: `notif-${Date.now()}`,
      tipo: "info",
      titulo: "Nuevo envío recibido",
      mensaje: `${submission.autorNombre} ha enviado: "${submission.titulo}"`,
      fecha: new Date().toISOString(),
      leida: false,
      submissionId: submission.id,
    });
  }

  updateSubmission(id: string, updates: Partial<Submission>) {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex((s) => s.id === id);
    if (index !== -1) {
      submissions[index] = {
        ...submissions[index],
        ...updates,
      };
      this.saveSubmissions(submissions);

      // Crear notificación si hay cambio de estado
      if (updates.estado) {
        this.addNotification({
          id: `notif-${Date.now()}`,
          tipo: "success",
          titulo: "Estado actualizado",
          mensaje: `El envío "${submissions[index].titulo}" cambió a: ${updates.estado}`,
          fecha: new Date().toISOString(),
          leida: false,
          submissionId: id,
        });
      }
    }
  }

  deleteSubmission(id: string) {
    const submissions = this.getSubmissions();
    const filtered = submissions.filter((s) => s.id !== id);
    this.saveSubmissions(filtered);
  }

  addComment(submissionId: string, comment: Comment) {
    const submissions = this.getSubmissions();
    const submission = submissions.find(
      (s) => s.id === submissionId,
    );
    if (submission) {
      submission.comentarios.push(comment);
      this.saveSubmissions(submissions);

      // Crear notificación
      this.addNotification({
        id: `notif-${Date.now()}`,
        tipo: "info",
        titulo: "Nuevo comentario",
        mensaje: `${comment.autor} comentó en: "${submission.titulo}"`,
        fecha: new Date().toISOString(),
        leida: false,
        submissionId,
      });
    }
  }

  // NOTIFICATIONS
  getNotifications(): Notification[] {
    const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveNotifications(notifications: Notification[]) {
    localStorage.setItem(
      this.NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );
  }

  addNotification(notification: Notification) {
    const notifications = this.getNotifications();
    notifications.unshift(notification); // Agregar al inicio
    this.saveNotifications(notifications);
  }

  markNotificationAsRead(id: string) {
    const notifications = this.getNotifications();
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.leida = true;
      this.saveNotifications(notifications);
    }
  }

  markAllNotificationsAsRead() {
    const notifications = this.getNotifications();
    notifications.forEach((n) => (n.leida = true));
    this.saveNotifications(notifications);
  }

  deleteNotification(id: string) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  }

  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter((n) => !n.leida).length;
  }

  // DRAFTS (Borradores)
  saveDraft(draft: Partial<Submission>) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const key = `${this.DRAFTS_KEY}_${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(draft));
    }
  }

  getDraft(): Partial<Submission> | null {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const key = `${this.DRAFTS_KEY}_${currentUser.id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  clearDraft() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const key = `${this.DRAFTS_KEY}_${currentUser.id}`;
      localStorage.removeItem(key);
    }
  }

  // STATISTICS
  getStatistics() {
    const submissions = this.getSubmissions();
    const totalSubmissions = submissions.length;
    const newSubmissions = submissions.filter(
      (s) => s.estado === "Nuevo",
    ).length;
    const inReview = submissions.filter(
      (s) => s.estado === "En revisión",
    ).length;
    const accepted = submissions.filter(
      (s) => s.estado === "Aceptado",
    ).length;
    const rejected = submissions.filter(
      (s) => s.estado === "Rechazado",
    ).length;
    const published = submissions.filter(
      (s) => s.estado === "Publicado",
    ).length;

    // Calcular tiempo promedio de revisión (simulado)
    const avgReviewTime = 12; // días

    // Tasa de aceptación
    const acceptanceRate =
      totalSubmissions > 0
        ? (
            ((accepted + published) / totalSubmissions) *
            100
          ).toFixed(1)
        : "0";

    return {
      totalSubmissions,
      newSubmissions,
      inReview,
      accepted,
      rejected,
      published,
      avgReviewTime,
      acceptanceRate,
    };
  }

  // Generar ID único para envíos
  generateSubmissionId(): string {
    const year = new Date().getFullYear();
    const submissions = this.getSubmissions();
    const count = submissions.length + 1;
    return `SUB-${year}-${String(count).padStart(3, "0")}`;
  }

  // Obtener actividad reciente
  getRecentActivity() {
    const submissions = this.getSubmissions();
    const notifications = this.getNotifications();

    const events = [
      ...submissions.slice(-5).map((s) => ({
        title: `Nuevo envío: ${s.titulo.substring(0, 50)}...`,
        date: new Date(s.fechaEnvio).toLocaleDateString(
          "es-ES",
          {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          },
        ),
      })),
      ...notifications.slice(0, 3).map((n) => ({
        title: n.titulo,
        date: new Date(n.fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    ];

    return events.slice(0, 5);
  }

  // MESSAGES
  getMessages(): Message[] {
    const data = localStorage.getItem(this.MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveMessages(messages: Message[]) {
    localStorage.setItem(
      this.MESSAGES_KEY,
      JSON.stringify(messages),
    );
  }

  addMessage(message: Message) {
    const messages = this.getMessages();
    messages.unshift(message); // Agregar al inicio
    this.saveMessages(messages);
  }

  markMessageAsRead(id: string) {
    const messages = this.getMessages();
    const message = messages.find((m) => m.id === id);
    if (message) {
      message.leido = true;
      this.saveMessages(messages);
    }
  }

  markAllMessagesAsRead() {
    const messages = this.getMessages();
    messages.forEach((m) => (m.leido = true));
    this.saveMessages(messages);
  }

  deleteMessage(id: string) {
    const messages = this.getMessages();
    const filtered = messages.filter((m) => m.id !== id);
    this.saveMessages(filtered);
  }

  getUnreadMessagesCount(): number {
    const messages = this.getMessages();
    return messages.filter((m) => !m.leido).length;
  }
}

export const storage = new StorageService();

// Inicializar al cargar
if (typeof window !== "undefined") {
  storage.init();
}