import { FormEvent, useEffect, useState } from 'react';
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createIssue,
  deleteIssue,
  getIssues,
  Issue,
  CreateIssuePayload,
  updateIssue,
  uploadIssueCover,
} from '../../services/issueService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { getApiOrigin } from '../lib/api';

const initialForm: CreateIssuePayload = {
  volume: 1,
  number: 1,
  year: new Date().getFullYear(),
  title: '',
  description: '',
  status: 'draft',
  published_at: null,
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const statusLabels: Record<Issue['status'], string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
};

const statusClasses: Record<Issue['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

const getCoverUrl = (coverUrl?: string | null) => {
  if (!coverUrl) return null;
  return coverUrl.startsWith('http') ? coverUrl : `${getApiOrigin()}${coverUrl}`;
};

export function IssuesManagement() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateIssuePayload>(initialForm);
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);
  const [deletingIssueId, setDeletingIssueId] = useState<number | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      setIssues(await getIssues());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar los volúmenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: CreateIssuePayload = {
        ...form,
        published_at: form.status === 'draft'
          ? null
          : form.published_at
            ? new Date(form.published_at).toISOString()
            : null,
      };
      if (editingIssueId) {
        const updated = await updateIssue(editingIssueId, payload);
        if (coverFile) {
          updated.cover_url = await uploadIssueCover(editingIssueId, coverFile);
        } else {
          const existing = issues.find((issue) => issue.id === editingIssueId);
          updated.cover_url = existing?.cover_url || null;
        }
        setIssues((current) => current.map((issue) => issue.id === editingIssueId ? updated : issue));
        toast.success('Número actualizado correctamente.');
      } else {
        const created = await createIssue(payload);
        if (coverFile) created.cover_url = await uploadIssueCover(created.id, coverFile);
        setIssues((current) => [created, ...current].sort((a, b) =>
          b.year - a.year || b.volume - a.volume || b.number - a.number
        ));
        toast.success('Número creado correctamente.');
      }
      setForm(initialForm);
      setEditingIssueId(null);
      setCoverFile(null);
      setCoverPreview(null);
      setDialogOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible guardar el número.');
    } finally {
      setSaving(false);
    }
  };

  const openCreateDialog = () => {
    setEditingIssueId(null);
    setForm(initialForm);
    setCoverFile(null);
    setCoverPreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = (issue: Issue) => {
    setEditingIssueId(issue.id);
    setForm({
      volume: issue.volume,
      number: issue.number,
      year: issue.year,
      title: issue.title || '',
      description: issue.description || '',
      status: issue.status,
      published_at: toDateTimeLocal(issue.published_at),
    });
    setCoverFile(null);
    setCoverPreview(getCoverUrl(issue.cover_url));
    setDialogOpen(true);
  };

  const handleDelete = async (issue: Issue) => {
    if (!window.confirm(`¿Eliminar el volumen ${issue.volume}, número ${issue.number} (${issue.year})?`)) return;
    setDeletingIssueId(issue.id);
    try {
      await deleteIssue(issue.id);
      setIssues((current) => current.filter((item) => item.id !== issue.id));
      toast.success('Número eliminado correctamente.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible eliminar el número.');
    } finally {
      setDeletingIssueId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de números</h1>
          <p className="text-sm text-gray-500 mt-1">Crea y consulta los números publicados por la revista.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}><Plus /> Nuevo número</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIssueId ? 'Editar número' : 'Crear número o volumen'}</DialogTitle>
              <DialogDescription>
                {editingIssueId ? 'Modifica la información editorial del número.' : 'Registra la información editorial del nuevo número.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm">Volumen
                  <Input type="number" min="1" required value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })} />
                </label>
                <label className="text-sm">Número
                  <Input type="number" min="1" required value={form.number}
                    onChange={(e) => setForm({ ...form, number: Number(e.target.value) })} />
                </label>
                <label className="text-sm">Año
                  <Input type="number" min="1" required value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
                </label>
              </div>
              <label className="text-sm block">Título
                <Input required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="text-sm block">Descripción
                <Textarea value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="text-sm block">Portada del número
                <Input
                  className="mt-1"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCoverFile(file);
                    setCoverPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </label>
              {coverPreview && (
                <img src={coverPreview} alt="Vista previa de la portada" className="h-44 w-32 rounded-md object-cover border" />
              )}
              <label className="text-sm block">Estado
                <select className="mt-1 h-9 w-full rounded-md border px-3 bg-white" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CreateIssuePayload['status'] })}>
                  <option value="draft">Borrador</option>
                  <option value="scheduled">Programado</option>
                  <option value="published">Publicado</option>
                </select>
              </label>
              {form.status !== 'draft' && (
                <label className="text-sm block">Fecha y hora de publicación
                  <Input
                    type="datetime-local"
                    required
                    value={form.published_at || ''}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  />
                </label>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} {editingIssueId ? 'Guardar cambios' : 'Crear número'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Cargando volúmenes...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  {getCoverUrl(issue.cover_url) ? (
                    <img src={getCoverUrl(issue.cover_url)!} alt={`Portada de ${issue.title || `Volumen ${issue.volume}`}`} className="h-20 w-14 rounded-md border object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><BookOpen className="text-red-600" /></div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{issue.title || `Volumen ${issue.volume}`}</h2>
                    <p className="text-sm text-gray-500">Vol. {issue.volume} · Núm. {issue.number} · {issue.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded-full px-2 py-1 ${statusClasses[issue.status] || statusClasses.draft}`}>
                    {statusLabels[issue.status] || 'Borrador'}
                  </span>
                  <Button type="button" variant="outline" size="icon" title="Editar número" onClick={() => openEditDialog(issue)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" title="Eliminar número" disabled={deletingIssueId === issue.id} onClick={() => void handleDelete(issue)}>
                    {deletingIssueId === issue.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-700" />}
                  </Button>
                </div>
              </div>
              {issue.description && <p className="mt-4 text-sm text-gray-600">{issue.description}</p>}
              {issue.published_at && (
                <p className="mt-3 text-xs text-gray-500">
                  {issue.status === 'scheduled' ? 'Programado para: ' : 'Fecha de publicación: '}
                  {new Date(issue.published_at.includes(' ') ? issue.published_at.replace(' ', 'T') : issue.published_at).toLocaleString()}
                </p>
              )}
            </article>
          ))}
          {issues.length === 0 && <p className="text-gray-500">No hay volúmenes registrados.</p>}
        </div>
      )}
    </div>
  );
}
