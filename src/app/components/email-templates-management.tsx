import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Loader2, Mail, Pencil, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  createTemplate,
  EmailTemplate,
  getTemplates,
  updateTemplate,
} from '../../services/emailTemplateService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

interface TemplateForm {
  template_key: string;
  name: string;
  subject: string;
  body_html: string;
}

const emptyForm: TemplateForm = {
  template_key: '',
  name: '',
  subject: '',
  body_html: '',
};

function findVariables(subject: string, bodyHtml: string): string[] {
  const variables = new Set<string>();
  const pattern = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;
  for (const content of [subject, bodyHtml]) {
    for (const match of content.matchAll(pattern)) variables.add(match[1]);
  }
  return [...variables];
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

const allowedHtmlTags = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'H1', 'H2', 'H3', 'BLOCKQUOTE',
]);
const blockedHtmlTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'FORM']);

function sanitizeHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const sanitized = document.createElement('div');

  const copyNode = (node: Node, parent: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ''));
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (blockedHtmlTags.has(node.tagName)) return;

    const tagName = allowedHtmlTags.has(node.tagName) ? node.tagName.toLowerCase() : null;
    const target = tagName ? document.createElement(tagName) : parent;
    if (tagName === 'a') {
      const href = node.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href, window.location.origin);
          if (['http:', 'https:', 'mailto:'].includes(url.protocol)) {
            target.setAttribute('href', href);
            target.setAttribute('rel', 'noopener noreferrer');
          }
        } catch {
          // Omit malformed links while preserving their text.
        }
      }
    }
    for (const child of Array.from(node.childNodes)) copyNode(child, target);
    if (tagName) parent.appendChild(target);
  };

  for (const child of Array.from(parsed.body.childNodes)) copyNode(child, sanitized);
  return sanitized.innerHTML;
}

interface VisualMessageEditorProps {
  initialHtml: string;
  resetKey: number;
  onChange: (html: string) => void;
}

function VisualMessageEditor({ initialHtml, resetKey, onChange }: VisualMessageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(initialHtml);
  }, [resetKey]);

  const runCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    if (editorRef.current) onChange(sanitizeHtml(editorRef.current.innerHTML));
  };

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-gray-300">
      <div className="flex items-center gap-1 border-b bg-gray-50 p-2" aria-label="Formato del mensaje">
        <Button type="button" variant="ghost" size="icon" aria-label="Negrita" title="Negrita"
          onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('bold')}>
          <Bold />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Cursiva" title="Cursiva"
          onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('italic')}>
          <Italic />
        </Button>
        <span className="mx-1 h-5 border-l border-gray-200" />
        <Button type="button" variant="ghost" size="icon" aria-label="Lista con viñetas" title="Lista con viñetas"
          onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertUnorderedList')}>
          <List />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Lista numerada" title="Lista numerada"
          onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Mensaje del correo"
        aria-multiline="true"
        data-placeholder="Escribe aquí el mensaje del correo..."
        className="min-h-48 whitespace-pre-wrap p-3 text-sm text-gray-800 outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
        onInput={(event) => onChange(sanitizeHtml(event.currentTarget.innerHTML))}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
      />
    </div>
  );
}

export function EmailTemplatesManagement() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);

  const loadTemplates = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTemplates(await getTemplates());
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No fue posible cargar las plantillas.';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const variables = useMemo(
    () => findVariables(form.subject, form.body_html),
    [form.subject, form.body_html]
  );

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setEditorResetKey((current) => current + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setForm({
      template_key: template.template_key,
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
    });
    setEditorResetKey((current) => current + 1);
    setDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        body_html: sanitizeHtml(form.body_html),
      };

      if (editingTemplate) {
        const updated = await updateTemplate(editingTemplate.template_key, payload);
        setTemplates((current) => current.map((item) =>
          item.template_key === updated.template_key ? updated : item
        ));
        toast.success('Plantilla actualizada correctamente.');
      } else {
        const created = await createTemplate({
          ...payload,
          template_key: form.template_key.trim(),
        });
        setTemplates((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Plantilla creada correctamente.');
      }

      setDialogOpen(false);
      setEditingTemplate(null);
      setForm(emptyForm);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible guardar la plantilla.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plantillas de correo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los mensajes institucionales y sus variables dinámicas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadTemplates()} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Actualizar
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus />
            Nueva plantilla
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={() => void loadTemplates()}>
            Reintentar
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-gray-500" />
            Plantillas disponibles
          </CardTitle>
          <CardDescription>Asunto, clave y fecha de última actualización.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && templates.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500" role="status">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando plantillas...
            </div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No hay plantillas disponibles. Crea la primera para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Clave</th>
                    <th className="px-3 py-3 font-medium">Asunto</th>
                    <th className="px-3 py-3 font-medium">Última actualización</th>
                    <th className="px-3 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4">
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <code className="text-xs text-gray-500">{template.template_key}</code>
                      </td>
                      <td className="max-w-md truncate px-3 py-4 text-gray-700" title={template.subject}>
                        {template.subject}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                        {formatUpdatedAt(template.updated_at)}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                          <Pencil />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) setDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar plantilla' : 'Crear plantilla'}</DialogTitle>
            <DialogDescription>
              Define el asunto y el mensaje. Los marcadores entre llaves dobles se detectan como variables.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingTemplate && (
              <label className="block space-y-1 text-sm font-medium">
                Clave
                <Input
                  required
                  pattern="[A-Za-z0-9][A-Za-z0-9_-]*"
                  maxLength={100}
                  value={form.template_key}
                  onChange={(event) => setForm({ ...form, template_key: event.target.value })}
                  placeholder="actualizacion_envio"
                />
              </label>
            )}
            <label className="block space-y-1 text-sm font-medium">
              Nombre
              <Input
                required
                maxLength={150}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Asunto
              <Input
                required
                maxLength={255}
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                placeholder="Hola {{nombre_autor}}, novedades sobre {{titulo_articulo}}"
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Mensaje
              <VisualMessageEditor
                key={editorResetKey}
                initialHtml={form.body_html}
                resetKey={editorResetKey}
                onChange={(body_html) => setForm((current) => ({ ...current, body_html }))}
              />
            </label>

            <div className="rounded-lg border bg-gray-50 p-3">
              <h3 className="text-sm font-medium text-gray-800">Variables disponibles</h3>
              <p className="mt-1 text-xs text-gray-500">
                Se reconocen automáticamente en el asunto y el cuerpo.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variables.length > 0 ? variables.map((variable) => (
                  <code key={variable} className="rounded bg-white px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
                    {'{{'}{variable}{'}}'}
                  </code>
                )) : <span className="text-xs text-gray-400">Aún no hay variables en el contenido.</span>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
