import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { ProductBrowser } from '../components/ProductBrowser';
import { EmptyState, ProductImage, TopBar } from '../components/ui';
import type { ProductTag } from '../data/types';
import { inSubcategory } from '../lib/filter';
import { itemsLabel } from '../lib/format';
import { useCategories, useProducts } from '../store/catalog';
import { useNav } from '../store/nav';

export function CatalogScreen() {
  const categories = useCategories();
  const products = useProducts();
  const push = useNav((s) => s.push);
  return (
    <div className="screen">
      <TopBar
        title="Каталог"
        right={
          <button className="icon-btn" onClick={() => push({ name: 'search' })} aria-label="Пошук">
            <Icon name="search" />
          </button>
        }
      />
      <div className="catalog-list">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <section key={c.id} className="catalog-cat">
              <button className="catalog-cat-head" onClick={() => push({ name: 'category', categoryId: c.id })}>
                <ProductImage src={c.image} alt={c.name} className="catalog-cat-img" />
                <div className="catalog-cat-text">
                  <h2>{c.name}</h2>
                  <p>{c.tagline}</p>
                  <span>{itemsLabel(count)}</span>
                </div>
                <Icon name="chevron" size={20} />
              </button>
              <div className="sub-chips">
                {c.subcategories.map((s) => (
                  <button key={s.id} className="chip" onClick={() => push({ name: 'category', categoryId: c.id, subId: s.id })}>
                    {s.name}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryScreen({ categoryId, subId }: { categoryId: string; subId?: string }) {
  const categories = useCategories();
  const all = useProducts();
  const back = useNav((s) => s.back);
  const replace = useNav((s) => s.replace);
  const push = useNav((s) => s.push);
  const cat = categories.find((c) => c.id === categoryId);
  const products = useMemo(
    () => (cat ? all.filter((p) => p.categoryId === cat.id && inSubcategory(p, cat, subId)) : []),
    [all, cat, subId],
  );

  if (!cat)
    return (
      <div className="screen">
        <TopBar title="Категорія" onBack={back} />
        <EmptyState icon="grid" title="Категорію не знайдено" text="Можливо, її прибрали з каталогу.">
          <button className="btn btn-primary" onClick={back}>
            Повернутися
          </button>
        </EmptyState>
      </div>
    );

  const sub = cat.subcategories.find((s) => s.id === subId);
  return (
    <div className="screen">
      <TopBar
        title={cat.name}
        sub={sub?.name}
        onBack={back}
        right={
          <button className="icon-btn" onClick={() => push({ name: 'search' })} aria-label="Пошук">
            <Icon name="search" />
          </button>
        }
      />
      <div className="sub-chips sub-chips-scroll">
        <button className={`chip ${!subId ? 'is-on' : ''}`} onClick={() => replace({ name: 'category', categoryId })}>
          Усі
        </button>
        {cat.subcategories.map((s) => (
          <button
            key={s.id}
            className={`chip ${subId === s.id ? 'is-on' : ''}`}
            onClick={() => replace({ name: 'category', categoryId, subId: s.id })}
          >
            {s.name}
          </button>
        ))}
      </div>
      <ProductBrowser key={`${categoryId}/${subId ?? ''}`} products={products} optionGroups={cat.filterOptions} />
    </div>
  );
}

const collectionTitles: Record<ProductTag, string> = {
  popular: 'Популярні товари',
  new: 'Новинки',
  recommended: 'Рекомендуємо',
  sale: 'Акції та знижки',
};

export function CollectionScreen({ tag }: { tag: ProductTag }) {
  const all = useProducts();
  const back = useNav((s) => s.back);
  const products = useMemo(() => all.filter((p) => p.tags.includes(tag)), [all, tag]);
  return (
    <div className="screen">
      <TopBar title={collectionTitles[tag]} onBack={back} />
      <ProductBrowser key={tag} products={products} optionGroups={['size', 'color', 'volume']} />
    </div>
  );
}
