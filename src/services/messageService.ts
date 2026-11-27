import { apiFetch } from '../app/lib/api';

export interface Message {
  id: string | number;
  asunto: string;
  contenido: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioNombre: string;
  fecha: string;
  leido: boolean | number;
  submissionId?: string | null;
}

export interface MessageRecipient {
  id: string;
  nombre: string;
  apellidos: string | null;
  role: 'admin' | 'author' | 'editor' | 'reviewer';
}

export async function getMessages(): Promise<Message[]> {
  const response = await apiFetch<{ messages: Message[] }>('/messages');
  return response.messages;
}

export async function getMessageRecipients(): Promise<MessageRecipient[]> {
  const response = await apiFetch<{ recipients: MessageRecipient[] }>('/messages/recipients');
  return response.recipients;
}

export async function sendMessage(data: {
  recipientId: string;
  subject: string;
  body: string;
  submissionId?: string;
}): Promise<Message> {
  const response = await apiFetch<{ message: Message }>('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.message;
}

export async function markMessageAsRead(id: string | number): Promise<void> {
  await apiFetch<{ message: string }>(`/messages/${encodeURIComponent(String(id))}/read`, {
    method: 'PATCH',
  });
}

export async function deleteMessage(id: string | number): Promise<void> {
  await apiFetch<{ message: string }>(`/messages/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
}
