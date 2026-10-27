import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { ProductBrowser } from '../components/ProductBrowser';
import { searchProducts } from '../lib/filter';
import { useCategories, useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop } from '../store/shop';

const suggestions = ['Кросівки', 'Adidas', 'Худі', 'Деревні аромати', 'Рюкзак', 'Годинник'];

export function SearchScreen({ initial }: { initial?: string }) {
  const products = useProducts();
  const categories = useCategories();
  const back = useNav((s) => s.back);
  const push = useNav((s) => s.push);
  const recent = useShop((s) => s.recentSearches);
  const addRecent = useShop((s) => s.addRecentSearch);
  const clearRecent = useShop((s) => s.clearRecentSearches);
  const [text, setText] = useState(initial ?? '');
  const [query, setQuery] = useState(initial ?? '');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 200);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!initial) input.current?.focus();
  }, [initial]);

  // Запам'ятовуємо запит, коли користувач перестав друкувати.
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => addRecent(query), 1200);
    return () => clearTimeout(t);
  }, [query, addRecent]);

  const results = useMemo(() => searchProducts(products, categories, query), [products, categories, query]);
  const matchedCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return categories.flatMap((c) => [
      ...(c.name.toLowerCase().includes(q) ? [{ c, s: undefined as string | undefined, label: c.name }] : []),
      ...c.subcategories.filter((s) => s.name.toLowerCase().includes(q)).map((s) => ({ c, s: s.id, label: `${c.name} · ${s.name}` })),
    ]).slice(0, 4);
  }, [categories, query]);

  const run = (q: string) => {
    setText(q);
    setQuery(q);
    addRecent(q);
  };

  return (
    <div className="screen">
      <header className="search-bar">
        <button className="icon-btn" onClick={back} aria-label="Назад">
          <Icon name="back" />
        </button>
        <form
          className="search-input"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            input.current?.blur();
            addRecent(text);
          }}
        >
          <Icon name="search" size={19} />
          <input
            id="search-query"
            ref={input}
            type="search"
            enterKeyHint="search"
            placeholder="Назва, бренд або категорія"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
          />
          {text && (
            <button type="button" className="clear-btn" onClick={() => run('')} aria-label="Очистити">
              <Icon name="close" size={16} />
            </button>
          )}
        </form>
      </header>

      {!query.trim() ? (
        <div className="search-idle">
          {recent.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Ви шукали</h2>
                <button className="link-btn" onClick={clearRecent}>
                  Очистити
                </button>
              </div>
              <div className="chips">
                {recent.map((r) => (
                  <button key={r} className="chip" onClick={() => run(r)}>
                    <Icon name="clock" size={14} />
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section>
            <div className="section-head">
              <h2>Часто шукають</h2>
            </div>
            <div className="chips">
              {suggestions.map((r) => (
                <button key={r} className="chip" onClick={() => run(r)}>
                  {r}
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="section-head">
              <h2>Категорії</h2>
            </div>
            <div className="list-links">
              {categories.map((c) => (
                <button key={c.id} onClick={() => push({ name: 'category', categoryId: c.id })}>
                  {c.name}
                  <Icon name="chevron" size={18} />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <ProductBrowser
          products={results}
          optionGroups={['size', 'color', 'volume']}
          emptyTitle="Нічого не знайдено"
          emptyText={`За запитом «${query.trim()}» товарів немає. Перевірте написання або спробуйте назву бренду.`}
          header={
            matchedCats.length > 0 && (
              <div className="list-links compact">
                {matchedCats.map((m) => (
                  <button key={m.label} onClick={() => push({ name: 'category', categoryId: m.c.id, subId: m.s })}>
                    <Icon name="grid" size={16} />
                    {m.label}
                    <Icon name="chevron" size={18} />
                  </button>
                ))}
              </div>
            )
          }
        />
      )}
    </div>
  );
}
