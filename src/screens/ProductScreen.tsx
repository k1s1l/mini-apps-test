import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { OptionPicker } from '../components/OptionPicker';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, Price, ProductImage, SectionHead, Stepper } from '../components/ui';
import type { Selection } from '../data/types';
import { discountPercent, formatPrice } from '../lib/format';
import { defaultSelection, isSelectionAvailable, missingGroups, priceFor, stockLabel } from '../lib/product';
import { addProductToCart, toggleFavorite } from '../store/actions';
import { useCategories, useProduct, useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop, MAX_QTY } from '../store/shop';

export function ProductScreen({ productId }: { productId: string }) {
  const product = useProduct(productId);
  const all = useProducts();
  const categories = useCategories();
  const back = useNav((s) => s.back);
  const push = useNav((s) => s.push);
  const isFav = useShop((s) => s.favorites.includes(productId));
  const [sel, setSel] = useState<Selection>(() => (product ? defaultSelection(product) : {}));
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [slide, setSlide] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) setSel(defaultSelection(product));
    setQty(1);
    setTried(false);
    setSlide(0);
    gallery.current?.scrollTo({ left: 0 });
  }, [product]);

  const similar = useMemo(
    () =>
      product
        ? all
            .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.stock !== 'out_of_stock')
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6)
        : [],
    [all, product],
  );

  if (!product)
    return (
      <div className="screen">
        <EmptyState icon="box" title="Товар не знайдено" text="Можливо, його вже прибрали з каталогу.">
          <button className="btn btn-primary" onClick={back}>
            Повернутися
          </button>
        </EmptyState>
      </div>
    );

  const p = product;
  const cat = categories.find((c) => c.id === p.categoryId);
  const { price, oldPrice } = priceFor(p, sel);
  const off = discountPercent(price, oldPrice);
  const oos = p.stock === 'out_of_stock';
  const complete = missingGroups(p, sel).length === 0;
  const comboOk = complete && isSelectionAvailable(p, sel);

  const goTo = (i: number) => {
    const el = gallery.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const onSelect = (next: Selection, groupId: string) => {
    setSel(next);
    if (groupId === 'color') {
      const idx = p.options.find((g) => g.id === 'color')?.values.find((v) => v.id === next.color)?.imageIndex;
      if (idx != null) goTo(idx);
    }
  };

  return (
    <div className="screen product">
      <div className="pd-gallery-wrap">
        <div
          className="pd-gallery"
          ref={gallery}
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {p.images.map((img, i) => (
            <ProductImage key={img + i} src={img} alt={`${p.name}, фото ${i + 1}`} className="pd-slide" />
          ))}
        </div>
        <div className="pd-float">
          <button className="icon-btn glass" onClick={back} aria-label="Назад">
            <Icon name="back" />
          </button>
          <button
            className={`icon-btn glass ${isFav ? 'is-fav' : ''}`}
            onClick={() => toggleFavorite(p)}
            aria-pressed={isFav}
            aria-label={isFav ? 'Прибрати з обраного' : 'Додати в обране'}
          >
            <Icon name="heart" filled={isFav} />
          </button>
        </div>
        {p.images.length > 1 && (
          <div className="pd-dots">
            {p.images.map((_, i) => (
              <button key={i} className={i === slide ? 'is-on' : ''} onClick={() => goTo(i)} aria-label={`Фото ${i + 1}`} />
            ))}
          </div>
        )}
        {p.imageIsRender && <span className="pd-render-note">Ілюстрація для демо</span>}
      </div>

      <div className="pd-body">
        <div className="pd-crumbs">
          {cat && (
            <button onClick={() => push({ name: 'category', categoryId: cat.id })}>{cat.name}</button>
          )}
          <span>·</span>
          <span>{p.brand}</span>
        </div>
        <h1 className="pd-title">{p.name}</h1>
        <div className="pd-price-row">
          <Price price={price} oldPrice={oldPrice} size="lg" />
          {off > 0 && <span className="badge badge-sale">−{off}%</span>}
        </div>
        <span className={`stock stock-${p.stock}`}>
          <i />
          {stockLabel[p.stock]}
        </span>

        {p.options.length > 0 && !oos && (
          <OptionPicker product={p} selection={sel} onChange={onSelect} highlightMissing={tried} />
        )}
        {complete && !comboOk && !oos && <p className="field-error">Такого поєднання зараз немає. Оберіть інший варіант.</p>}

        <section className="pd-section">
          <h2>Опис</h2>
          <p>{p.description}</p>
        </section>

        <section className="pd-section">
          <h2>Характеристики</h2>
          <dl className="specs">
            <div>
              <dt>Бренд</dt>
              <dd>{p.brand}</dd>
            </div>
            {p.attributes.map((a) => (
              <div key={a.label}>
                <dt>{a.label}</dt>
                <dd>{a.value}</dd>
              </div>
            ))}
            {p.options.map((g) => (
              <div key={g.id}>
                <dt>{g.label}</dt>
                <dd>
                  {g.values
                    .filter((v) => v.available)
                    .map((v) => v.label)
                    .join(', ') || 'Немає в наявності'}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <ul className="pd-perks">
          <li>
            <Icon name="truck" size={20} />
            Доставка Новою поштою, Укрпоштою або кур’єром
          </li>
          <li>
            <Icon name="refresh" size={20} />
            Умови обміну та повернення буде додано до запуску магазину
          </li>
        </ul>

        {similar.length > 0 && (
          <section className="home-section flush">
            <SectionHead title="Схожі товари" action="Усі" onAction={() => push({ name: 'category', categoryId: p.categoryId })} />
            <div className="rail">
              {similar.map((s) => (
                <ProductCard key={s.id} product={s} variant="rail" />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="buy-bar">
        {oos ? (
          <button className="btn btn-block" disabled>
            Немає в наявності
          </button>
        ) : (
          <>
            <Stepper value={qty} onChange={(v) => setQty(Math.max(1, Math.min(MAX_QTY, v)))} max={MAX_QTY} />
            <button
              className="btn btn-primary btn-grow"
              onClick={() => {
                setTried(true);
                if (addProductToCart(p, sel, qty)) setQty(1);
              }}
            >
              <span>У кошик</span>
              <span className="btn-sum">{formatPrice(price * qty)}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
