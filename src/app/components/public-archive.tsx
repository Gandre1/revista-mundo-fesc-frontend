import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookOpen, Search } from 'lucide-react';
import {
  getPublicIssue,
  getPublicIssues,
  PublicArticle,
  PublicIssueDetail,
} from '../../services/publicService';
import type { Issue } from '../../services/issueService';
import { getApiOrigin, resolveApiUrl } from '../lib/api';

export function PublicArchive() {
  const { id } = useParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [detail, setDetail] = useState<PublicIssueDetail | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setDetail(null);

    const load = id ? getPublicIssue(id) : getPublicIssues();
    Promise.resolve(load)
      .then((result) => {
        if (!active) return;
        if (id) setDetail(result as PublicIssueDetail);
        else setIssues(result as Issue[]);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No fue posible cargar el archivo público.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const issueLabel = (issue: Issue) =>
    `Volumen ${issue.volume} · Número ${issue.number} · ${issue.year}`;
  const coverUrl = (issue: Issue) =>
    issue.cover_url
      ? issue.cover_url.startsWith('http') ? issue.cover_url : `${getApiOrigin()}${issue.cover_url}`
      : null;
  const filteredIssues = issues.filter((issue) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      issue.title,
      issue.description,
      String(issue.volume),
      String(issue.number),
      String(issue.year),
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e30513]">
                <BookOpen className="h-6 w-6 text-white" />
              </span>
              <span>
                <span className="block text-base font-semibold leading-tight text-gray-900">Mundo FESC</span>
                <span className="block text-xs text-gray-500">Revista científica</span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm" aria-label="Acceso al sistema">
              <Link to="/register" className="text-gray-700 transition-colors hover:text-[#e30513]">Registrarse</Link>
              <Link to="/login" className="rounded-lg bg-[#e30513] px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700">Entrar</Link>
            </nav>
          </div>
          <nav className="mt-4 flex flex-wrap items-center gap-x-5 text-sm" aria-label="Navegación principal">
            <Link to="/" className="font-semibold text-[#e30513]">Inicio</Link>
            <Link to="/" className="text-gray-700 transition-colors hover:text-[#e30513]">Actual</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex justify-end">
          <label className="flex w-full max-w-xs items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
            <span className="sr-only">Buscar</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              className="min-w-0 flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
            />
            <Search className="h-4 w-4" aria-hidden="true" />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <nav className="mb-4 text-sm text-[#e30513]" aria-label="Migas de pan">
              <Link to="/" className="hover:underline">Inicio</Link>
              <span className="mx-2 text-slate-400">/</span>
              <span>{detail ? 'Número' : 'Archivos'}</span>
            </nav>
            <h1 className="mb-6 text-2xl font-bold text-slate-900">
              {detail ? detail.issue.title || `Archivo histórico — ${issueLabel(detail.issue)}` : 'Archivos'}
            </h1>

            {loading && <p className="text-slate-500" role="status">Cargando publicaciones...</p>}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">{error}</p>}

        {!loading && !error && !id && (
          <section className="space-y-5">
            {filteredIssues.map((issue) => (
              <Link
                key={issue.id}
                to={`/public/issues/${issue.id}`}
                className="flex gap-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {coverUrl(issue) ? (
                  <img src={coverUrl(issue)!} alt={`Portada de ${issue.title || `Volumen ${issue.volume}`}`} className="h-36 w-28 shrink-0 rounded-md border object-cover" />
                ) : (
                  <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-md bg-slate-200 text-center text-xs font-bold text-slate-500">
                    Mundo FESC
                  </div>
                )}
                <div className="pt-1">
                  <p className="text-sm font-semibold text-[#e30513]">{issueLabel(issue)}</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{issue.title || 'Número de revista'}</h2>
                  {issue.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{issue.description}</p>}
                </div>
              </Link>
            ))}
            {filteredIssues.length === 0 && <p className="text-slate-500">No hay volúmenes publicados disponibles.</p>}
          </section>
        )}

        {!loading && !error && id && detail && (
          <section>
            <Link to="/" className="mb-5 inline-block text-sm font-semibold text-[#e30513]">
              ← Volver al archivo
            </Link>
            <p className="mb-2 text-sm text-slate-600">{issueLabel(detail.issue)}</p>
            {detail.issue.description && <p className="mb-8 text-slate-700">{detail.issue.description}</p>}

            <div className="space-y-4">
              {detail.articles.map((article: PublicArticle) => (
                <article key={article.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{article.seccion || 'Artículo'}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    <Link to={`/public/submissions/${article.id}`} className="hover:text-[#e30513] hover:underline">
                      {article.titulo}
                    </Link>
                  </h2>
                  {article.authors.length > 0 && (
                    <p className="mt-2 text-sm text-slate-600">
                      {article.authors.map((author) => `${author.nombre} ${author.apellidos}`.trim()).join(', ')}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {article.doi && <span className="text-sm text-slate-600">DOI: {article.doi}</span>}
                    {article.pdf_galley_url && (
                      <a href={resolveApiUrl(article.pdf_galley_url) || undefined} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#e30513]">
                        PDF
                      </a>
                    )}
                    {article.html_galley_url && (
                      <a href={resolveApiUrl(article.html_galley_url) || undefined} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#e30513]">
                        HTML
                      </a>
                    )}
                  </div>
                </article>
              ))}
              {detail.articles.length === 0 && <p className="text-slate-500">Este volumen aún no tiene artículos publicados.</p>}
            </div>
          </section>
        )}
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5" aria-label="Opciones del sitio">
            <h2 className="text-base font-bold text-slate-700">Idioma</h2>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-[#1d5d9b]">
              <span>English</span>
              <span>Español</span>
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}
