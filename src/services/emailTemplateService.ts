import { apiFetch } from '../app/lib/api';

export interface EmailTemplate {
  id: number;
  template_key: string;
  name: string;
  subject: string;
  body_html: string;
  variables_disponibles: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailTemplatePayload {
  name: string;
  subject: string;
  body_html: string;
  variables_disponibles?: string[];
}

export interface CreateEmailTemplatePayload extends EmailTemplatePayload {
  template_key: string;
}

export async function getTemplates(): Promise<EmailTemplate[]> {
  const response = await apiFetch<{ templates: EmailTemplate[] }>('/email-templates');
  return response.templates;
}

export async function getTemplateByKey(key: string): Promise<EmailTemplate> {
  const response = await apiFetch<{ template: EmailTemplate }>(
    `/email-templates/${encodeURIComponent(key)}`
  );
  return response.template;
}

export async function createTemplate(data: CreateEmailTemplatePayload): Promise<EmailTemplate> {
  const response = await apiFetch<{ template: EmailTemplate }>('/email-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.template;
}

export async function updateTemplate(id: string, data: EmailTemplatePayload): Promise<EmailTemplate> {
  const response = await apiFetch<{ template: EmailTemplate }>(
    `/email-templates/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.template;
}
