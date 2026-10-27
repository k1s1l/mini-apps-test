import { memo } from 'react';
import type { Product } from '../data/types';
import { discountPercent } from '../lib/format';
import { minPrice, stockLabel } from '../lib/product';
import { quickAdd, toggleFavorite } from '../store/actions';
import { useNav } from '../store/nav';
import { useShop } from '../store/shop';
import { Icon } from './Icon';
import { Price, ProductImage } from './ui';

interface Props {
  product: Product;
  variant?: 'grid' | 'rail';
}

export const ProductCard = memo(function ProductCard({ product: p, variant = 'grid' }: Props) {
  const isFav = useShop((s) => s.favorites.includes(p.id));
  const push = useNav((s) => s.push);
  const { price, hasRange } = minPrice(p);
  const off = discountPercent(p.price, p.oldPrice) || discountPercent(price, p.options.flatMap((g) => g.values).find((v) => v.price === price)?.oldPrice);
  const oos = p.stock === 'out_of_stock';
  const open = () => push({ name: 'product', productId: p.id });

  return (
    <article className={`card card-${variant} ${oos ? 'is-oos' : ''}`}>
      <button className="card-media" onClick={open} aria-label={`${p.brand} ${p.name}`}>
        <ProductImage src={p.images[0]} alt={p.name} brand={p.brand} />
        <div className="card-badges">
          {off > 0 && <span className="badge badge-sale">−{off}%</span>}
          {p.tags.includes('new') && <span className="badge">Новинка</span>}
        </div>
      </button>
      <button
        className={`fav-btn ${isFav ? 'is-on' : ''}`}
        onClick={() => toggleFavorite(p)}
        aria-pressed={isFav}
        aria-label={isFav ? 'Прибрати з обраного' : 'Додати в обране'}
      >
        <Icon name="heart" size={19} filled={isFav} />
      </button>
      <div className="card-body" onClick={open}>
        <span className="card-brand">{p.brand}</span>
        <h3 className="card-name">{p.name}</h3>
        {variant === 'grid' && <p className="card-desc">{p.shortDescription}</p>}
        <span className={`stock stock-${p.stock}`}>
          <i />
          {stockLabel[p.stock]}
        </span>
      </div>
      <div className="card-foot">
        <Price price={price} oldPrice={hasRange ? undefined : p.oldPrice} from={hasRange} />
        <button
          className="cart-btn"
          onClick={() => quickAdd(p)}
          disabled={oos}
          aria-label={oos ? 'Немає в наявності' : 'Додати в кошик'}
        >
          <Icon name={oos ? 'close' : 'plus'} size={18} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
});
