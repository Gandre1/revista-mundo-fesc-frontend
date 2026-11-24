import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, Eye, EyeOff, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createHelpContent,
  deleteHelpContent,
  getAllHelpContents,
  HelpAudience,
  HelpContent,
  HelpContentPayload,
  HelpContentType,
  updateHelpContent,
} from '../../services/helpService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface HelpFormState extends Omit<HelpContentPayload, 'display_order'> {
  display_order: string;
}

const emptyForm: HelpFormState = {
  title: '',
  slug: '',
  category: '',
  content_type: 'faq',
  audience: 'general',
  content: '',
  display_order: '0',
  is_active: true,
};

const contentTypeLabels: Record<HelpContentType, string> = {
  faq: 'FAQ',
  guide: 'Guía',
  policy: 'Política',
};

const audienceLabels: Record<HelpAudience, string> = {
  general: 'Todos',
  author: 'Autores',
  reviewer: 'Revisores',
  editor: 'Editores',
};

function createSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function sortHelpContents(items: HelpContent[]): HelpContent[] {
  return [...items].sort(
    (first, second) =>
      first.display_order - second.display_order || first.id - second.id
  );
}

function getErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function HelpManagement() {
  const [items, setItems] = useState<HelpContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<HelpContentType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState<HelpAudience | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HelpContent | null>(null);
  const [form, setForm] = useState<HelpFormState>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<HelpContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadContents = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await getAllHelpContents());
    } catch (cause) {
      const message = getErrorMessage(cause, 'No fue posible cargar los contenidos de ayuda.');
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContents();
  }, []);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesType = typeFilter === 'all' || item.content_type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesAudience = audienceFilter === 'all' || item.audience === audienceFilter;
        const isActive = item.is_active === 1;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && isActive) ||
          (statusFilter === 'inactive' && !isActive);
        return matchesType && matchesCategory && matchesAudience && matchesStatus;
      }),
    [items, typeFilter, categoryFilter, audienceFilter, statusFilter]
  );

  const openCreateDialog = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setSlugEdited(false);
    setDialogOpen(true);
  };

  const openEditDialog = (item: HelpContent) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      content_type: item.content_type,
      audience: item.audience,
      content: item.content,
      display_order: String(item.display_order),
      is_active: item.is_active === 1,
    });
    setSlugEdited(true);
    setDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const displayOrder = Number(form.display_order);
    if (!Number.isSafeInteger(displayOrder) || displayOrder < 0) {
      toast.error('El orden debe ser un entero no negativo.');
      return;
    }

    const payload: HelpContentPayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      content_type: form.content_type,
      audience: form.audience,
      content: form.content,
      display_order: displayOrder,
      is_active: form.is_active,
    };

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      toast.error('El slug debe usar letras minúsculas, números y guiones.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const updated = await updateHelpContent(editingItem.id, payload);
        setItems((current) =>
          sortHelpContents(current.map((item) => (item.id === updated.id ? updated : item)))
        );
        toast.success('Contenido actualizado correctamente.');
      } else {
        const created = await createHelpContent(payload);
        setItems((current) => sortHelpContents([...current, created]));
        toast.success('Contenido creado correctamente.');
      }
      setDialogOpen(false);
    } catch (cause) {
      toast.error(getErrorMessage(cause, 'No fue posible guardar el contenido.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (item: HelpContent) => {
    const nextIsActive = item.is_active !== 1;
    setUpdatingId(item.id);
    try {
      const updated = await updateHelpContent(item.id, {
        title: item.title,
        slug: item.slug,
        category: item.category,
        content_type: item.content_type,
        audience: item.audience,
        content: item.content,
        display_order: item.display_order,
        is_active: nextIsActive,
      });
      setItems((current) =>
        sortHelpContents(current.map((currentItem) => currentItem.id === updated.id ? updated : currentItem))
      );
      toast.success(nextIsActive ? 'Contenido activado.' : 'Contenido desactivado.');
    } catch (cause) {
      toast.error(getErrorMessage(cause, 'No fue posible cambiar el estado del contenido.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await deleteHelpContent(deleteCandidate.id);
      setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
      toast.success('Contenido eliminado correctamente.');
      setDeleteCandidate(null);
    } catch (cause) {
      toast.error(getErrorMessage(cause, 'No fue posible eliminar el contenido.'));
    } finally {
      setDeleting(false);
    }
  };

  const updateForm = <K extends keyof HelpFormState>(key: K, value: HelpFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de ayuda</h1>
          <p className="mt-1 text-sm text-slate-600">
            Administra las preguntas frecuentes, guías y políticas visibles en el portal público.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadContents()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button type="button" onClick={openCreateDialog} className="bg-[#e30513] text-white hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo contenido
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenidos de ayuda</CardTitle>
          <CardDescription>
            {filteredItems.length} de {items.length} contenidos · ordenados por orden de visualización.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="help-filter-type">Tipo</Label>
              <select id="help-filter-type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as HelpContentType | 'all')}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <option value="all">Todos los tipos</option>
                <option value="faq">FAQ</option>
                <option value="guide">Guía</option>
                <option value="policy">Política</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-filter-category">Categoría</Label>
              <select id="help-filter-category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <option value="all">Todas las categorías</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-filter-audience">Audiencia</Label>
              <select id="help-filter-audience" value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value as HelpAudience | 'all')}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <option value="all">Todas las audiencias</option>
                {Object.entries(audienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-filter-status">Estado</Label>
              <select id="help-filter-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          {loadError && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              <span>{loadError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadContents()}>Reintentar</Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando contenidos...
            </div>
          ) : !loadError && filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-medium text-slate-800">No hay contenidos para estos filtros.</p>
              <p className="mt-1 text-sm text-slate-500">Crea un contenido o cambia los filtros aplicados.</p>
            </div>
          ) : !loadError && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">Contenido</th>
                    <th scope="col" className="px-4 py-3">Tipo / categoría</th>
                    <th scope="col" className="px-4 py-3">Audiencia</th>
                    <th scope="col" className="px-4 py-3">Orden</th>
                    <th scope="col" className="px-4 py-3">Estado</th>
                    <th scope="col" className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const active = item.is_active === 1;
                    return (
                      <tr key={item.id} className="align-top">
                        <td className="max-w-sm px-4 py-4">
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 break-all text-xs text-slate-500">{item.slug}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">{contentTypeLabels[item.content_type]}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{audienceLabels[item.audience]}</td>
                        <td className="px-4 py-4 tabular-nums text-slate-700">{item.display_order}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="icon" title={active ? 'Desactivar contenido' : 'Activar contenido'}
                              aria-label={active ? `Desactivar ${item.title}` : `Activar ${item.title}`}
                              disabled={updatingId === item.id}
                              onClick={() => void toggleVisibility(item)}>
                              {updatingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" title="Editar contenido"
                              aria-label={`Editar ${item.title}`} onClick={() => openEditDialog(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" title="Eliminar contenido"
                              aria-label={`Eliminar ${item.title}`} className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteCandidate(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar contenido' : 'Crear contenido de ayuda'}</DialogTitle>
            <DialogDescription>
              Completa los datos que se mostrarán en el Centro de Ayuda público.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="help-title">Título</Label>
                <Input id="help-title" value={form.title} maxLength={255} required
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: slugEdited ? current.slug : createSlug(title),
                    }));
                  }} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="help-slug">Slug</Label>
                <Input id="help-slug" value={form.slug} maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" required
                  onChange={(event) => {
                    setSlugEdited(true);
                    updateForm('slug', event.target.value);
                  }} />
                <p className="text-xs text-slate-500">Identificador único; se genera desde el título y puedes ajustarlo.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-type">Tipo</Label>
                <select id="help-type" value={form.content_type} onChange={(event) => updateForm('content_type', event.target.value as HelpContentType)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <option value="faq">FAQ</option>
                  <option value="guide">Guía</option>
                  <option value="policy">Política</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-category">Categoría</Label>
                <Input id="help-category" value={form.category} maxLength={100} required onChange={(event) => updateForm('category', event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-audience">Audiencia objetivo</Label>
                <select id="help-audience" value={form.audience} onChange={(event) => updateForm('audience', event.target.value as HelpAudience)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <option value="general">Todos</option>
                  <option value="author">Autores</option>
                  <option value="reviewer">Revisores</option>
                  <option value="editor">Editores</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-order">Orden de visualización</Label>
                <Input id="help-order" type="number" min={0} step={1} required value={form.display_order}
                  onChange={(event) => updateForm('display_order', event.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="help-content">Contenido</Label>
                <Textarea id="help-content" value={form.content} required rows={8}
                  onChange={(event) => updateForm('content', event.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={form.is_active} onChange={(event) => updateForm('is_active', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#e30513] focus-visible:ring-2 focus-visible:ring-red-500" />
                Contenido activo y visible públicamente
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" className="bg-[#e30513] text-white hover:bg-red-700" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Guardar cambios' : 'Crear contenido'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => {
        if (!open && !deleting) setDeleteCandidate(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este contenido?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente “{deleteCandidate?.title}”. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
