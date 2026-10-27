import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { ProductImage, SectionHead } from '../components/ui';
import { imageUrl } from '../data/images';
import type { Product, ProductTag } from '../data/types';
import { sortProducts } from '../lib/filter';
import { useCategories, useCatalog, useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop } from '../store/shop';

const byTag = (products: Product[], tag: ProductTag, sort: 'popular' | 'new' = 'popular') =>
  sortProducts(products.filter((p) => p.tags.includes(tag) && p.stock !== 'out_of_stock'), sort);

export function HomeScreen() {
  const products = useProducts();
  const categories = useCategories();
  const isDemo = useCatalog((s) => s.catalog?.isDemo);
  const push = useNav((s) => s.push);
  const switchTab = useNav((s) => s.switchTab);
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));

  const sections = useMemo(
    () => ({
      popular: byTag(products, 'popular').slice(0, 8),
      fresh: byTag(products, 'new', 'new').slice(0, 8),
      recommended: byTag(products, 'recommended').slice(0, 8),
      sale: byTag(products, 'sale').slice(0, 4),
    }),
    [products],
  );

  return (
    <div className="screen home">
      <header className="home-bar">
        <div className="logo">
          <span className="logo-mark">КРАМ</span>
          <span className="logo-sub">мультикаталог</span>
        </div>
        <div className="home-bar-actions">
          <button className="icon-btn" onClick={() => push({ name: 'search' })} aria-label="Пошук">
            <Icon name="search" />
          </button>
          <button className="icon-btn" onClick={() => switchTab('cart')} aria-label="Кошик">
            <Icon name="bag" />
            {cartCount > 0 && <span className="dot-count">{cartCount}</span>}
          </button>
        </div>
      </header>

      {isDemo && (
        <div className="demo-note">
          <Icon name="info" size={16} />
          <span>Демоверсія: товари, ціни та наявність умовні</span>
        </div>
      )}

      <section className="hero" onClick={() => push({ name: 'collection', tag: 'new' })}>
        <img src={imageUrl('hero')} alt="" className="hero-img" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow">Осінь 2026</span>
          <h1>Нове надходження</h1>
          <p>Кросівки, одяг та аксесуари на сезон</p>
          <span className="hero-cta">
            Дивитися новинки <Icon name="arrowRight" size={18} />
          </span>
        </div>
      </section>

      <button className="search-field" onClick={() => push({ name: 'search' })}>
        <Icon name="search" size={20} />
        <span>Пошук товарів і брендів</span>
      </button>

      <section className="home-section">
        <SectionHead title="Категорії" action="Усі" onAction={() => switchTab('catalog')} />
        <div className="cat-rail">
          {categories.map((c) => (
            <button key={c.id} className="cat-tile" onClick={() => push({ name: 'category', categoryId: c.id })}>
              <ProductImage src={c.image} alt={c.name} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <Rail title="Популярні товари" items={sections.popular} onAll={() => push({ name: 'collection', tag: 'popular' })} />
      <Rail title="Новинки" items={sections.fresh} onAll={() => push({ name: 'collection', tag: 'new' })} />
      <Rail title="Рекомендуємо" items={sections.recommended} onAll={() => push({ name: 'collection', tag: 'recommended' })} />

      <section className="home-section sale-block">
        <SectionHead title="Акції та знижки" action="Усі акції" onAction={() => push({ name: 'collection', tag: 'sale' })} />
        <div className="grid">
          {sections.sale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <button className="btn btn-outline btn-block catalog-cta" onClick={() => switchTab('catalog')}>
        Перейти до всього каталогу
        <Icon name="arrowRight" size={18} />
      </button>
    </div>
  );
}

function Rail({ title, items, onAll }: { title: string; items: Product[]; onAll(): void }) {
  if (!items.length) return null;
  return (
    <section className="home-section">
      <SectionHead title={title} action="Усі" onAction={onAll} />
      <div className="rail">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="rail" />
        ))}
      </div>
    </section>
  );
}
