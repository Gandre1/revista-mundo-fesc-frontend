import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import {
  downloadScieloXml,
  getPublicSubmissionDetail,
  getScieloXmlUrl,
  type PublicSubmissionDetail,
} from '../../services/publicService';
import { resolveApiUrl } from '../lib/api';

export function PublicSubmissionDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState<PublicSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citationFormat, setCitationFormat] = useState<'apa' | 'ieee'>('apa');
  const [copiedCitation, setCopiedCitation] = useState(false);

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

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}.`)
      .join(' ');

  const getApaCitation = () => {
    if (!article) return '';
    const authors = article.authors.map((author) => {
      const surname = author.apellidos?.trim();
      const initials = getInitials(author.nombre || '');
      return surname ? `${surname}, ${initials}`.trim() : '';
    }).filter(Boolean);
    const authorsText = authors.length > 1
      ? `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`
      : authors[0] || '';
    const year = issue?.year || '';
    const title = article.titulo || '';
    const volume = issue?.volume ? `, ${issue.volume}` : '';
    const number = issue?.number ? `(${issue.number})` : '';
    const doi = article.doi ? `. https://doi.org/${article.doi.replace(/^https?:\/\/doi\.org\//i, '')}` : '';
    return `${authorsText}${authorsText ? '. ' : ''}(${year}). ${title}. Revista Mundo FESC${volume}${number}${doi}`;
  };

  const getIeeeCitation = () => {
    if (!article) return '';
    const authors = article.authors.map((author) => {
      const initials = getInitials(author.nombre || '');
      return `${initials} ${author.apellidos || ''}`.trim();
    }).filter(Boolean);
    const authorsText = authors.length > 1
      ? `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`
      : authors[0] || '';
    const volume = issue?.volume ? `, vol. ${issue.volume}` : '';
    const number = issue?.number ? `, no. ${issue.number}` : '';
    const year = issue?.year ? `, ${issue.year}` : '';
    const doi = article.doi ? `, doi: ${article.doi}` : '';
    return `${authorsText}, "${article.titulo}," Revista Mundo FESC${volume}${number}${year}${doi}.`;
  };

  const citationText = citationFormat === 'apa' ? getApaCitation() : getIeeeCitation();

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(true);
      window.setTimeout(() => setCopiedCitation(false), 1800);
    } catch {
      setError('No fue posible copiar la cita al portapapeles.');
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
                Citar / Exportar metadatos
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
                <p className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                  {citationText}
                </p>
                <button
                  type="button"
                  onClick={() => void copyCitation()}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {copiedCitation ? 'Cita copiada' : 'Copiar cita'}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
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
