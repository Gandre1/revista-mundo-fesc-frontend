import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { BookOpen, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  searchPublicArticles,
  type PublicSearchQuery,
  type PublicSearchResponse,
  type PublicSearchSort,
} from '../../services/searchService';
import { getDashboardPath, useAuth } from './auth-context';

const PAGE_SIZE = 10;

interface SearchFormValues {
  q: string;
  author: string;
  volume: string;
  issue: string;
  section: string;
  year: string;
  doi: string;
  sort: PublicSearchSort;
}

const emptyForm: SearchFormValues = {
  q: '',
  author: '',
  volume: '',
  issue: '',
  section: '',
  year: '',
  doi: '',
  sort: 'relevance',
};

function getFormValues(search: string): SearchFormValues {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  return {
    q: params.get('q') || params.get('query') || '',
    author: params.get('author') || '',
    volume: params.get('volume') || '',
    issue: params.get('issue') || '',
    section: params.get('section') || '',
    year: params.get('year') || '',
    doi: params.get('doi') || '',
    sort: sort === 'recent' || sort === 'title' ? sort : 'relevance',
  };
}

function getSearchQuery(search: string): PublicSearchQuery {
  const params = new URLSearchParams(search);
  const values = getFormValues(search);
  const page = Number(params.get('page') || 1);
  return {
    q: values.q || undefined,
    author: values.author || undefined,
    volume: values.volume ? Number(values.volume) : undefined,
    issue: values.issue ? Number(values.issue) : undefined,
    section: values.section || undefined,
    year: values.year ? Number(values.year) : undefined,
    doi: values.doi || undefined,
    sort: values.sort,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
  };
}

export function PublicSearch() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const query = useMemo(() => getSearchQuery(search), [search]);
  const [form, setForm] = useState<SearchFormValues>(() => getFormValues(search));
  const [response, setResponse] = useState<PublicSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(getFormValues(search));
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    searchPublicArticles(query)
      .then((result) => {
        if (active) setResponse(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No fue posible buscar artículos públicos.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const updateForm = (field: keyof SearchFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    (Object.keys(form) as Array<keyof SearchFormValues>).forEach((key) => {
      const value = form[key].trim();
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setForm(emptyForm);
    setSearchParams({});
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(search);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const pagination = response?.pagination;
  const firstResult = pagination && pagination.total > 0
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const lastResult = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e30513]">
                <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold leading-tight text-gray-900">Mundo FESC</span>
                <span className="block text-xs text-gray-500">Revista científica</span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm" aria-label="Acceso al sistema">
              {user ? (
                <>
                  <span className="hidden text-gray-600 sm:inline">Hola, {user.nombre}</span>
                  <Link to={getDashboardPath(user.role)} className="rounded-lg bg-[#e30513] px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700">
                    Panel de gestión
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/', { replace: true });
                    }}
                    className="text-gray-700 transition-colors hover:text-[#e30513]"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-gray-700 transition-colors hover:text-[#e30513]">Registrarse</Link>
                  <Link to="/login" className="rounded-lg bg-[#e30513] px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700">Entrar</Link>
                </>
              )}
            </nav>
          </div>
          <nav className="mt-4 flex flex-wrap items-center gap-x-5 text-sm" aria-label="Navegación principal">
            <Link to="/" className="text-gray-700 transition-colors hover:text-[#e30513]">Inicio</Link>
            <Link to="/public/issues" className="text-gray-700 transition-colors hover:text-[#e30513]">Archivo histórico</Link>
            <Link to="/public/search" aria-current="page" className="font-semibold text-[#e30513]">Búsqueda avanzada</Link>
            <Link to="/help" className="text-gray-700 transition-colors hover:text-[#e30513]">Centro de ayuda</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-4 text-sm text-[#e30513]" aria-label="Migas de pan">
          <Link to="/" className="hover:underline">Inicio</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link to="/public/issues" className="hover:underline">Archivo histórico</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>Búsqueda avanzada</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-950">Búsqueda avanzada</h1>
        <p className="mt-2 text-slate-600">Consulta artículos publicados en el archivo de la Revista Mundo FESC.</p>

        <form onSubmit={submitSearch} className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Filtros de búsqueda de artículos">
          <label htmlFor="public-search-q" className="mb-2 block text-sm font-semibold text-slate-800">Buscar artículos</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="public-search-q"
                type="search"
                value={form.q}
                onChange={(event) => updateForm('q', event.target.value)}
                placeholder="Título, resumen o palabras clave"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100"
              />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e30513] px-5 py-3 font-semibold text-white transition hover:bg-red-700">
              <Search className="h-4 w-4" aria-hidden="true" />
              Buscar
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-slate-700">
              Autor
              <input value={form.author} onChange={(event) => updateForm('author', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Volumen
              <input type="number" min="1" step="1" value={form.volume} onChange={(event) => updateForm('volume', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Número
              <input type="number" min="1" step="1" value={form.issue} onChange={(event) => updateForm('issue', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Sección
              <input value={form.section} onChange={(event) => updateForm('section', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Año
              <input type="number" min="1" step="1" value={form.year} onChange={(event) => updateForm('year', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              DOI
              <input value={form.doi} onChange={(event) => updateForm('doi', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Ordenar por
              <select value={form.sort} onChange={(event) => updateForm('sort', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#e30513] focus:ring-2 focus:ring-red-100">
                <option value="relevance">Relevancia</option>
                <option value="recent">Fecha (más reciente)</option>
                <option value="title">Título</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <X className="h-4 w-4" aria-hidden="true" />
              Limpiar filtros
            </button>
          </div>
        </form>

        <section className="mt-8" aria-label="Resultados de búsqueda">
          {loading && <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600" role="status">Buscando artículos...</p>}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700" role="alert">{error}</p>}

          {!loading && !error && response && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600" aria-live="polite">
                  {pagination?.total === 0
                    ? 'No se encontraron artículos.'
                    : `Mostrando ${firstResult}–${lastResult} de ${pagination?.total ?? 0} resultados`}
                </p>
              </div>

              {response.articles.length > 0 ? (
                <div className="space-y-4">
                  {response.articles.map((article) => (
                    <article key={article.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#e30513]">
                        {article.seccion || 'Artículo'}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        <Link to={`/public/submissions/${article.id}`} className="hover:text-[#e30513] hover:underline">
                          {article.titulo}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {article.authors || 'Autoría no disponible'}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Volumen {article.volume} · Número {article.issue} · {article.year}
                      </p>
                      {article.doi && <p className="mt-1 break-all text-sm text-slate-600">DOI: {article.doi}</p>}
                      {article.resumen && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{article.resumen}</p>}
                      <Link to={`/public/submissions/${article.id}`} className="mt-4 inline-block text-sm font-semibold text-[#e30513] hover:underline">
                        Ver artículo
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
                  No hay artículos que coincidan con los filtros. Prueba con otros términos o limpia los filtros.
                </p>
              )}

              {pagination && pagination.totalPages > 1 && (
                <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Paginación de resultados">
                  <button
                    type="button"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600" aria-live="polite">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
