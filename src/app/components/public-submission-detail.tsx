import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { BookOpen, Download, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboardPath, useAuth } from './auth-context';
import {
  downloadPublicArticleCitation,
  downloadScieloXml,
  getPublicArticleCitation,
  getPublicArticleMetrics,
  getPublicSubmissionDetail,
  getScieloXmlUrl,
  type PublicArticleCitation,
  type PublicArticleMetrics,
  type PublicSubmissionDetail,
} from '../../services/publicService';
import { resolveApiUrl } from '../lib/api';

export function PublicSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [detail, setDetail] = useState<PublicSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citationFormat, setCitationFormat] = useState<'apa' | 'ieee'>('apa');
  const [citation, setCitation] = useState<PublicArticleCitation | null>(null);
  const [citationLoading, setCitationLoading] = useState(false);
  const [metrics, setMetrics] = useState<PublicArticleMetrics | null>(null);
  const [citationDownload, setCitationDownload] = useState<'bibtex' | 'ris' | null>(null);

  useEffect(() => {
    if (!id) {
      setError('El identificador del artículo no es válido.');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    getPublicSubmissionDetail(id)
      .then((result) => {
        if (active) setDetail(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No fue posible cargar el artículo público.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const article = detail?.article;
  const issue = detail?.issue;

  useEffect(() => {
    if (!article?.id) {
      setCitation(null);
      return;
    }

    let active = true;
    setCitation(null);
    setCitationLoading(true);
    getPublicArticleCitation(article.id, citationFormat)
      .then((result) => {
        if (active) setCitation(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          toast.error(cause instanceof Error ? cause.message : 'No fue posible cargar la cita.');
        }
      })
      .finally(() => {
        if (active) setCitationLoading(false);
      });

    return () => {
      active = false;
    };
  }, [article?.id, citationFormat]);

  useEffect(() => {
    if (!article?.id) {
      setMetrics(null);
      return;
    }

    let active = true;
    setMetrics(null);
    getPublicArticleMetrics(article.id)
      .then((result) => {
        if (active) setMetrics(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          toast.error(cause instanceof Error ? cause.message : 'No fue posible cargar las métricas.');
        }
      });

    return () => {
      active = false;
    };
  }, [article?.id]);

  const copyCitation = async () => {
    if (!citation || citationLoading) return;
    try {
      await navigator.clipboard.writeText(citation.citation);
      toast.success(`Cita ${citation.style === 'apa' ? 'APA 7' : 'IEEE'} copiada al portapapeles.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible copiar la cita al portapapeles.');
    }
  };

  const downloadCitation = async (format: 'bibtex' | 'ris') => {
    if (!article || citationDownload) return;
    setCitationDownload(format);
    try {
      await downloadPublicArticleCitation(article.id, format);
      toast.success(`Referencia ${format === 'bibtex' ? 'BibTeX' : 'RIS'} descargada.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible descargar la referencia.');
    } finally {
      setCitationDownload(null);
    }
  };

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
              {user ? (
                <>
                  <span className="hidden text-gray-600 sm:inline">Hola, {user.nombre}</span>
                  <Link
                    to={getDashboardPath(user.role)}
                    className="rounded-lg bg-[#e30513] px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                  >
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
            <Link to="/" className="font-semibold text-[#e30513]">Inicio</Link>
            <Link to="/" className="text-gray-700 transition-colors hover:text-[#e30513]">Actual</Link>
            <Link to="/public/issues" className="text-gray-700 transition-colors hover:text-[#e30513]">Archivo histórico</Link>
            <Link to="/public/search" className="text-gray-700 transition-colors hover:text-[#e30513]">Búsqueda avanzada</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10">

        {loading && (
          <p className="mt-10 rounded-lg border border-slate-200 bg-white p-6 text-slate-500" role="status">
            Cargando artículo...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6" role="alert">
            <p className="font-semibold text-red-700">{error}</p>
            <Link to="/" className="mt-3 inline-block text-sm font-semibold text-[#e30513]">
              Volver al archivo público
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <article className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            {issue && (
              <Link to={`/public/issues/${issue.id}`} className="text-sm font-semibold text-[#e30513]">
                Volumen {issue.volume} · Número {issue.number} · {issue.year}
              </Link>
            )}
            {article.seccion && (
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
                {article.seccion}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
              {article.titulo}
            </h1>

            <section className="mt-5 flex flex-wrap gap-3" aria-label="Métricas públicas del artículo">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                <Eye className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>{metrics ? metrics.views.toLocaleString() : '—'} vistas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                <Download className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>{metrics ? metrics.downloads.toLocaleString() : '—'} descargas de galeras</span>
              </div>
            </section>

            {article.authors.length > 0 && (
              <section className="mt-5" aria-label="Autores">
                <h2 className="text-sm font-bold text-slate-900">Autores</h2>
                <div className="mt-1 space-y-1 text-slate-700">
                  {article.authors.map((author, index) => (
                    <p key={`${author.nombre}-${author.apellidos}-${index}`}>
                      {[author.nombre, author.apellidos].filter(Boolean).join(' ').trim()}
                      {author.afiliacion ? ` — ${author.afiliacion}` : ''}
                    </p>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8" aria-labelledby="abstract-heading">
              <h2 id="abstract-heading" className="text-lg font-bold text-slate-900">Resumen (Abstract)</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                {article.resumen || 'Resumen no disponible.'}
              </p>
            </section>

            {article.palabras_clave && (
              <section className="mt-6" aria-label="Palabras clave">
                <h2 className="text-sm font-bold text-slate-900">Palabras clave</h2>
                <p className="mt-1 text-slate-700">{article.palabras_clave}</p>
              </section>
            )}

            {article.doi && (
              <section className="mt-6" aria-label="DOI">
                <h2 className="text-sm font-bold text-slate-900">DOI</h2>
                <p className="mt-1 break-all text-slate-700">{article.doi}</p>
              </section>
            )}

            <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5" aria-labelledby="export-heading">
              <h2 id="export-heading" className="text-sm font-bold text-slate-900">
                Cómo citar
              </h2>
              <div className="mt-4 border-b border-slate-200" role="tablist" aria-label="Formato de cita">
                <button
                  type="button"
                  role="tab"
                  aria-selected={citationFormat === 'apa'}
                  onClick={() => setCitationFormat('apa')}
                  className={`mr-2 border-b-2 px-3 py-2 text-sm font-semibold ${
                    citationFormat === 'apa'
                      ? 'border-[#e30513] text-[#e30513]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  APA 7
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={citationFormat === 'ieee'}
                  onClick={() => setCitationFormat('ieee')}
                  className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                    citationFormat === 'ieee'
                      ? 'border-[#e30513] text-[#e30513]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IEEE
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                <p aria-live="polite" className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                  {citationLoading
                    ? 'Cargando referencia...'
                    : citation?.citation || 'No fue posible obtener la referencia bibliográfica.'}
                </p>
                <button
                  type="button"
                  onClick={() => void copyCitation()}
                  disabled={!citation || citationLoading}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Copiar cita
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void downloadCitation('bibtex')}
                  disabled={citationDownload !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {citationDownload === 'bibtex' ? 'Descargando BibTeX...' : 'Descargar BibTeX (.bib)'}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadCitation('ris')}
                  disabled={citationDownload !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {citationDownload === 'ris' ? 'Descargando RIS...' : 'Descargar RIS (.ris)'}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(getScieloXmlUrl(article.id), '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e30513] px-4 py-2 text-sm font-semibold text-[#e30513] transition hover:bg-red-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver XML SciELO / JATS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void downloadScieloXml(article.id).catch((cause: unknown) => {
                      setError(cause instanceof Error ? cause.message : 'No fue posible descargar el XML.');
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#e30513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <Download className="h-4 w-4" />
                  Descargar XML
                </button>
              </div>
            </section>

            {(article.pdf_galley_url || article.html_galley_url) && (
              <section className="mt-8 flex flex-wrap gap-3" aria-label="Galeras del artículo">
                {article.pdf_galley_url && (
                  <a
                    href={resolveApiUrl(article.pdf_galley_url) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-[#e30513] px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                  >
                    Ver / descargar PDF
                  </a>
                )}
                {article.html_galley_url && (
                  <a
                    href={resolveApiUrl(article.html_galley_url) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#e30513] px-5 py-3 font-semibold text-[#e30513] transition hover:bg-red-50"
                  >
                    Ver galera HTML
                  </a>
                )}
              </section>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
