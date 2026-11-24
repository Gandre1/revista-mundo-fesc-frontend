import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Search } from 'lucide-react';
import {
  getPublicHelpContents,
  HelpContent,
  HelpContentType,
} from '../../services/helpService';

const typeLabels: Record<HelpContentType, string> = {
  faq: 'Preguntas frecuentes',
  guide: 'Guías',
  policy: 'Políticas',
};

const audienceLabels = {
  author: 'Autores',
  reviewer: 'Revisores',
  editor: 'Editores',
} as const;

const typeFilters: Array<{ value: HelpContentType | 'all'; label: string }> = [
  { value: 'all', label: 'Todo el contenido' },
  { value: 'faq', label: 'FAQs' },
  { value: 'guide', label: 'Guías' },
  { value: 'policy', label: 'Políticas' },
];

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
        active
          ? 'border-[#e30513] bg-[#e30513] text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-[#e30513]'
      }`}
    >
      {children}
    </button>
  );
}

export function PublicHelp() {
  const [items, setItems] = useState<HelpContent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<HelpContentType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState<'all' | keyof typeof audienceLabels>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPublicHelpContents()
      .then((contents) => {
        if (active) setItems(contents);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No fue posible cargar el centro de ayuda.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))),
    [items]
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const matchesType = selectedType === 'all' || item.content_type === selectedType;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesAudience =
        selectedAudience === 'all' ||
        item.audience === 'general' ||
        item.audience === selectedAudience;
      const matchesSearch =
        !query ||
        item.title.toLocaleLowerCase().includes(query) ||
        item.content.toLocaleLowerCase().includes(query);
      return matchesType && matchesCategory && matchesAudience && matchesSearch;
    });
  }, [items, search, selectedType, selectedCategory, selectedAudience]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e30513]">
              <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold leading-tight text-slate-900">Mundo FESC</span>
              <span className="block text-xs text-slate-500">Revista científica</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm" aria-label="Navegación principal">
            <Link to="/" className="text-slate-700 transition-colors hover:text-[#e30513]">Inicio</Link>
            <Link to="/login" className="rounded-lg bg-[#e30513] px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700">Entrar</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <section className="mb-8 rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#e30513]">Estamos para ayudarte</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Centro de ayuda</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Encuentra respuestas, políticas y guías para publicar y colaborar con la revista Mundo FESC.
          </p>
          <label className="mt-6 flex max-w-3xl items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Buscar en el centro de ayuda</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por pregunta o palabra clave..."
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Filtros de ayuda">
          <div className="space-y-5">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-800">Tipo de contenido</h2>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <FilterButton
                    key={filter.value}
                    active={selectedType === filter.value}
                    onClick={() => setSelectedType(filter.value)}
                  >
                    {filter.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-800">Categoría</h2>
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
                    Todas
                  </FilterButton>
                  {categories.map((category) => (
                    <FilterButton
                      key={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </FilterButton>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-800">Dirigido a</h2>
              <div className="flex flex-wrap gap-2">
                <FilterButton active={selectedAudience === 'all'} onClick={() => setSelectedAudience('all')}>
                  Todos
                </FilterButton>
                {(Object.keys(audienceLabels) as Array<keyof typeof audienceLabels>).map((audience) => (
                  <FilterButton
                    key={audience}
                    active={selectedAudience === audience}
                    onClick={() => setSelectedAudience(audience)}
                  >
                    {audienceLabels[audience]}
                  </FilterButton>
                ))}
              </div>
            </div>
          </div>
        </section>

        {loading && <p className="py-8 text-center text-slate-500" role="status">Cargando contenidos de ayuda...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">{error}</p>}

        {!loading && !error && (
          <section aria-label="Contenidos de ayuda">
            <p className="mb-4 text-sm text-slate-500" aria-live="polite">
              {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 sm:px-6">
                        <span>
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#c9000c]">
                              {typeLabels[item.content_type]}
                            </span>
                            <span className="text-xs font-medium text-slate-500">{item.category}</span>
                          </span>
                          <span className="mt-2 block text-base font-semibold text-slate-900 sm:text-lg">{item.title}</span>
                        </span>
                        <span aria-hidden="true" className="mt-1 shrink-0 text-xl leading-none text-[#e30513] transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                        <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{item.content}</div>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h2 className="font-semibold text-slate-800">No encontramos resultados</h2>
                <p className="mt-2 text-sm text-slate-500">Prueba con otras palabras o cambia los filtros.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
