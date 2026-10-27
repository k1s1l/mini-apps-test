// Список товарів з фільтрами й сортуванням. Використовується в категоріях,
// добірках і пошуку.

import { useMemo, useState } from 'react';
import type { Product } from '../data/types';
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  facetValues,
  sortLabels,
  sortProducts,
  type Filters,
  type SortKey,
} from '../lib/filter';
import { formatPrice, itemsLabel } from '../lib/format';
import { Icon } from './Icon';
import { ProductCard } from './ProductCard';
import { EmptyState, Sheet } from './ui';

interface Props {
  products: Product[];
  /** Групи варіантів для фільтрів (size, color, volume…). */
  optionGroups: string[];
  initialFilters?: Partial<Filters>;
  emptyTitle?: string;
  emptyText?: string;
  header?: React.ReactNode;
}

export function ProductBrowser({ products, optionGroups, initialFilters, emptyTitle, emptyText, header }: Props) {
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters(), ...initialFilters });
  // Якщо популярність не задана (усі нулі) — за замовчуванням показуємо новинки.
  const [sort, setSort] = useState<SortKey>(() =>
    products.some((p) => p.popularity !== products[0]?.popularity) ? 'popular' : 'new',
  );
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);

  const facets = useMemo(() => facetValues(products, optionGroups), [products, optionGroups]);
  const result = useMemo(() => sortProducts(applyFilters(products, filters), sort), [products, filters, sort]);
  const count = activeFilterCount(filters);
  const reset = () => setFilters(emptyFilters());

  return (
    <>
      {header}
      <div className="toolbar">
        <button className={`tool-btn ${count ? 'is-on' : ''}`} onClick={() => setSheet('filters')}>
          <Icon name="filter" size={18} />
          Фільтри
          {count > 0 && <span className="tool-count">{count}</span>}
        </button>
        <button className="tool-btn" onClick={() => setSheet('sort')}>
          <Icon name="sort" size={18} />
          {sortLabels[sort]}
        </button>
        <span className="toolbar-total">{itemsLabel(result.length)}</span>
      </div>

      {count > 0 && (
        <div className="active-filters">
          {(filters.priceMin != null || filters.priceMax != null) && (
            <button className="chip is-on" onClick={() => setFilters({ ...filters, priceMin: undefined, priceMax: undefined })}>
              {filters.priceMin != null ? `від ${formatPrice(filters.priceMin)} ` : ''}
              {filters.priceMax != null ? `до ${formatPrice(filters.priceMax)}` : ''}
              <Icon name="close" size={14} />
            </button>
          )}
          {filters.brands.map((b) => (
            <button key={b} className="chip is-on" onClick={() => setFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })}>
              {b}
              <Icon name="close" size={14} />
            </button>
          ))}
          {Object.entries(filters.options).flatMap(([gid, vals]) =>
            vals.map((v) => (
              <button
                key={gid + v}
                className="chip is-on"
                onClick={() => setFilters({ ...filters, options: { ...filters.options, [gid]: vals.filter((x) => x !== v) } })}
              >
                {v}
                <Icon name="close" size={14} />
              </button>
            )),
          )}
          {filters.inStockOnly && (
            <button className="chip is-on" onClick={() => setFilters({ ...filters, inStockOnly: false })}>
              В наявності <Icon name="close" size={14} />
            </button>
          )}
          {filters.saleOnly && (
            <button className="chip is-on" onClick={() => setFilters({ ...filters, saleOnly: false })}>
              Зі знижкою <Icon name="close" size={14} />
            </button>
          )}
          <button className="link-btn" onClick={reset}>
            Скинути все
          </button>
        </div>
      )}

      {result.length ? (
        <div className="grid">
          {result.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title={emptyTitle ?? 'Нічого не знайдено'}
          text={count ? 'Спробуйте змінити або скинути фільтри.' : emptyText ?? 'У цьому розділі поки немає товарів.'}
        >
          {count > 0 && (
            <button className="btn btn-primary" onClick={reset}>
              Очистити фільтри
            </button>
          )}
        </EmptyState>
      )}

      <FilterSheet
        open={sheet === 'filters'}
        onClose={() => setSheet(null)}
        facets={facets}
        value={filters}
        onApply={(f) => {
          setFilters(f);
          setSheet(null);
        }}
        preview={(f) => applyFilters(products, f).length}
      />

      <Sheet open={sheet === 'sort'} onClose={() => setSheet(null)} title="Сортування">
        <div className="sort-list">
          {(Object.keys(sortLabels) as SortKey[]).map((k) => (
            <button
              key={k}
              className={`sort-item ${sort === k ? 'is-on' : ''}`}
              onClick={() => {
                setSort(k);
                setSheet(null);
              }}
            >
              {sortLabels[k]}
              {sort === k && <Icon name="check" size={20} />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

interface FilterSheetProps {
  open: boolean;
  onClose(): void;
  facets: ReturnType<typeof facetValues>;
  value: Filters;
  onApply(f: Filters): void;
  preview(f: Filters): number;
}

function FilterSheet({ open, onClose, facets, value, onApply, preview }: FilterSheetProps) {
  const [f, setF] = useState<Filters>(value);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');
  const [wasOpen, setWasOpen] = useState(false);

  // Синхронізуємо чернетку фільтрів при кожному відкритті.
  if (open && !wasOpen) {
    setWasOpen(true);
    setF(value);
    setMinText(value.priceMin != null ? String(value.priceMin) : '');
    setMaxText(value.priceMax != null ? String(value.priceMax) : '');
  } else if (!open && wasOpen) setWasOpen(false);

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const parse = (t: string) => {
    const n = parseInt(t.replace(/\D/g, ''), 10);
    return isNaN(n) ? undefined : n;
  };
  const priceErr =
    parse(minText) != null && parse(maxText) != null && parse(minText)! > parse(maxText)!
      ? 'Мінімальна ціна більша за максимальну'
      : null;
  const draft: Filters = { ...f, priceMin: parse(minText), priceMax: parse(maxText) };
  const n = preview(draft);
  const [lo, hi] = facets.priceRange;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Фільтри"
      footer={
        <div className="sheet-actions">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setF(emptyFilters());
              setMinText('');
              setMaxText('');
            }}
          >
            Скинути
          </button>
          <button className="btn btn-primary" disabled={!!priceErr} onClick={() => onApply(draft)}>
            {n ? `Показати ${itemsLabel(n)}` : 'Немає товарів'}
          </button>
        </div>
      }
    >
      <section className="f-section">
        <h3>Ціна, ₴</h3>
        <div className="price-inputs">
          <label>
            <span>від</span>
            <input id="f-price-min" inputMode="numeric" placeholder={String(lo)} value={minText} onChange={(e) => setMinText(e.target.value.replace(/\D/g, ''))} />
          </label>
          <span className="dash" />
          <label>
            <span>до</span>
            <input id="f-price-max" inputMode="numeric" placeholder={String(hi)} value={maxText} onChange={(e) => setMaxText(e.target.value.replace(/\D/g, ''))} />
          </label>
        </div>
        {priceErr && <p className="field-error">{priceErr}</p>}
        <div className="chips">
          {[
            ['до 1 500', undefined, 1500],
            ['1 500 – 3 000', 1500, 3000],
            ['3 000 – 5 000', 3000, 5000],
            ['від 5 000', 5000, undefined],
          ].map(([label, a, b]) => (
            <button
              key={label as string}
              className={`chip ${parse(minText) === a && parse(maxText) === b ? 'is-on' : ''}`}
              onClick={() => {
                setMinText(a != null ? String(a) : '');
                setMaxText(b != null ? String(b) : '');
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="f-section">
        <h3>Наявність</h3>
        <label className="switch-row">
          <span>Лише в наявності</span>
          <input type="checkbox" id="f-instock" checked={f.inStockOnly} onChange={(e) => setF({ ...f, inStockOnly: e.target.checked })} />
          <i className="switch" />
        </label>
        <label className="switch-row">
          <span>Лише зі знижкою</span>
          <input type="checkbox" id="f-sale" checked={f.saleOnly} onChange={(e) => setF({ ...f, saleOnly: e.target.checked })} />
          <i className="switch" />
        </label>
      </section>

      {facets.groups.map((g) => (
        <section className="f-section" key={g.id}>
          <h3>{g.label}</h3>
          <div className="chips">
            {g.values.map((v) => {
              const on = (f.options[g.id] ?? []).includes(v.label);
              return (
                <button
                  key={v.label}
                  className={`chip ${on ? 'is-on' : ''}`}
                  onClick={() => setF({ ...f, options: { ...f.options, [g.id]: toggle(f.options[g.id] ?? [], v.label) } })}
                >
                  {v.swatch && <span className="chip-swatch" style={{ background: v.swatch }} />}
                  {v.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {facets.brands.length > 1 && (
        <section className="f-section">
          <h3>Бренд</h3>
          <div className="chips">
            {facets.brands.map((b) => (
              <button key={b} className={`chip ${f.brands.includes(b) ? 'is-on' : ''}`} onClick={() => setF({ ...f, brands: toggle(f.brands, b) })}>
                {b}
              </button>
            ))}
          </div>
        </section>
      )}
    </Sheet>
  );
}
