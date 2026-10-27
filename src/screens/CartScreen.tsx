import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { EmptyState, ProductImage, Stepper, TopBar } from '../components/ui';
import { resolveCart, type CartLine } from '../lib/cart';
import { formatPrice, itemsLabel } from '../lib/format';
import { isValueSelectable } from '../lib/product';
import { useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop, MAX_QTY } from '../store/shop';
import { toast } from '../store/toast';

export function CartScreen() {
  const cart = useShop((s) => s.cart);
  const products = useProducts();
  const push = useNav((s) => s.push);
  const switchTab = useNav((s) => s.switchTab);
  const summary = useMemo(() => resolveCart(cart, products), [cart, products]);

  if (!cart.length)
    return (
      <div className="screen">
        <TopBar title="Кошик" />
        <EmptyState icon="bag" title="Кошик порожній" text="Додайте товари з каталогу — вони збережуться тут, навіть якщо закрити застосунок.">
          <button className="btn btn-primary" onClick={() => switchTab('catalog')}>
            Перейти до покупок
          </button>
          <button className="btn btn-ghost" onClick={() => switchTab('favorites')}>
            Відкрити обране
          </button>
        </EmptyState>
      </div>
    );

  return (
    <div className="screen cart">
      <TopBar title="Кошик" sub={itemsLabel(summary.count)} />
      <div className="cart-list">
        {summary.lines.map((l) => (
          <CartRow key={l.item.key} line={l} />
        ))}
      </div>

      <button className="btn btn-ghost btn-block" onClick={() => switchTab('catalog')}>
        <Icon name="back" size={18} />
        Продовжити покупки
      </button>

      <section className="summary">
        <div>
          <span>Товари ({summary.count})</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>
        {summary.savings > 0 && (
          <div className="is-save">
            <span>Знижка</span>
            <span>−{formatPrice(summary.savings)}</span>
          </div>
        )}
        <div className="is-muted">
          <span>Доставка</span>
          <span>за тарифами перевізника</span>
        </div>
        <div className="summary-total">
          <span>Разом</span>
          <span>{formatPrice(summary.total)}</span>
        </div>
      </section>

      {summary.hasUnavailable && (
        <p className="warn-note">
          <Icon name="info" size={18} />
          Деяких товарів уже немає в наявності. Приберіть їх або оберіть інший варіант, щоб оформити замовлення.
        </p>
      )}

      <div className="buy-bar">
        <div className="buy-bar-total">
          <span>Разом</span>
          <b>{formatPrice(summary.total)}</b>
        </div>
        <button
          className="btn btn-primary btn-grow"
          disabled={summary.hasUnavailable || summary.count === 0}
          onClick={() => push({ name: 'checkout' })}
        >
          Оформити замовлення
        </button>
      </div>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { item, product: p } = line;
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeFromCart);
  const add = useShop((s) => s.addToCart);
  const changeSelection = useShop((s) => s.changeSelection);
  const push = useNav((s) => s.push);

  const removeWithUndo = () => {
    remove(item.key);
    toast('Товар прибрано з кошика', {
      action: { label: 'Повернути', run: () => add(item.productId, item.selection, item.qty) },
    });
  };

  if (!p)
    return (
      <article className="cart-row is-missing">
        <div className="cart-row-main">
          <p>Цього товару більше немає в каталозі.</p>
          <button className="link-btn" onClick={() => remove(item.key)}>
            Прибрати
          </button>
        </div>
      </article>
    );

  const colorIdx = p.options.find((g) => g.id === 'color')?.values.find((v) => v.id === item.selection.color)?.imageIndex;

  return (
    <article className={`cart-row ${line.available ? '' : 'is-unavailable'}`}>
      <button className="cart-row-img" onClick={() => push({ name: 'product', productId: p.id })} aria-label={p.name}>
        <ProductImage src={p.images[colorIdx ?? 0]} alt={p.name} />
      </button>
      <div className="cart-row-main">
        <span className="card-brand">{p.brand}</span>
        <h3 onClick={() => push({ name: 'product', productId: p.id })}>{p.name}</h3>
        <div className="cart-variants">
          {p.options.map((g) =>
            g.values.length > 1 ? (
              <label key={g.id} className="mini-select">
                <span>{g.label}</span>
                <select
                  id={`cart-${item.key}-${g.id}`}
                  value={item.selection[g.id] ?? ''}
                  onChange={(e) => changeSelection(item.key, { ...item.selection, [g.id]: e.target.value })}
                >
                  {g.values.map((v) => {
                    const ok = isValueSelectable(p, g.id, v.id, item.selection);
                    return (
                      <option key={v.id} value={v.id} disabled={!ok && v.id !== item.selection[g.id]}>
                        {v.label}
                        {ok ? '' : ' — немає'}
                      </option>
                    );
                  })}
                </select>
                <i />
              </label>
            ) : (
              <span key={g.id} className="mini-fixed">
                {g.label}: {g.values[0].label}
              </span>
            ),
          )}
        </div>
        {!line.available && <p className="field-error">Немає в наявності</p>}
        <div className="cart-row-foot">
          <Stepper value={item.qty} onChange={(v) => setQty(item.key, v)} max={MAX_QTY} />
          <div className="cart-row-price">
            <b>{formatPrice(line.lineTotal)}</b>
            {item.qty > 1 && <small>{formatPrice(line.unitPrice)} / шт.</small>}
          </div>
        </div>
      </div>
      <button className="icon-btn cart-remove" onClick={removeWithUndo} aria-label="Прибрати з кошика">
        <Icon name="trash" size={19} />
      </button>
    </article>
  );
}
