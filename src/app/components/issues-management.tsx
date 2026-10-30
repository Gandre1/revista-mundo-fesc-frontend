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
} from '../../services/issueService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

const initialForm: CreateIssuePayload = {
  volume: 1,
  number: 1,
  year: new Date().getFullYear(),
  title: '',
  description: '',
  status: 'draft',
};

export function IssuesManagement() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateIssuePayload>(initialForm);
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);

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
      if (editingIssueId) {
        const updated = await updateIssue(editingIssueId, form);
        setIssues((current) => current.map((issue) => issue.id === editingIssueId ? updated : issue));
        toast.success('Número actualizado correctamente.');
      } else {
        const created = await createIssue(form);
        setIssues((current) => [created, ...current].sort((a, b) =>
          b.year - a.year || b.volume - a.volume || b.number - a.number
        ));
        toast.success('Número creado correctamente.');
      }
      setForm(initialForm);
      setEditingIssueId(null);
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
    });
    setDialogOpen(true);
  };

  const handleDelete = async (issue: Issue) => {
    if (!window.confirm(`¿Eliminar el volumen ${issue.volume}, número ${issue.number} (${issue.year})?`)) return;
    try {
      await deleteIssue(issue.id);
      setIssues((current) => current.filter((item) => item.id !== issue.id));
      toast.success('Número eliminado correctamente.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible eliminar el número.');
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
              <label className="text-sm block">Estado
                <select className="mt-1 h-9 w-full rounded-md border px-3 bg-white" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </label>
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
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><BookOpen className="text-red-600" /></div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{issue.title || `Volumen ${issue.volume}`}</h2>
                    <p className="text-sm text-gray-500">Vol. {issue.volume} · Núm. {issue.number} · {issue.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded-full px-2 py-1 ${issue.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {issue.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  <Button type="button" variant="outline" size="icon" title="Editar número" onClick={() => openEditDialog(issue)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" title="Eliminar número" onClick={() => void handleDelete(issue)}>
                    <Trash2 className="h-4 w-4 text-red-700" />
                  </Button>
                </div>
              </div>
              {issue.description && <p className="mt-4 text-sm text-gray-600">{issue.description}</p>}
            </article>
          ))}
          {issues.length === 0 && <p className="text-gray-500">No hay volúmenes registrados.</p>}
        </div>
      )}
    </div>
  );
}
