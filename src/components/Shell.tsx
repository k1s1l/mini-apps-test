// Каркас: нижнє меню, сповіщення, швидкий вибір варіанта.

import { useEffect, useState } from 'react';
import type { Selection } from '../data/types';
import { defaultSelection, priceFor, stockLabel } from '../lib/product';
import { addProductToCart, useQuickAdd } from '../store/actions';
import { useProduct } from '../store/catalog';
import { useActiveTab, useNav, type Tab } from '../store/nav';
import { useShop } from '../store/shop';
import { useToast } from '../store/toast';
import { Icon } from './Icon';
import { OptionPicker } from './OptionPicker';
import { Price, ProductImage, Sheet } from './ui';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Головна', icon: 'home' },
  { id: 'catalog', label: 'Каталог', icon: 'grid' },
  { id: 'favorites', label: 'Обране', icon: 'heart' },
  { id: 'cart', label: 'Кошик', icon: 'bag' },
  { id: 'profile', label: 'Профіль', icon: 'user' },
];

export function BottomNav() {
  const active = useActiveTab();
  const switchTab = useNav((s) => s.switchTab);
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const favCount = useShop((s) => s.favorites.length);
  return (
    <nav className="bottom-nav" aria-label="Основне меню">
      {tabs.map((t) => {
        const count = t.id === 'cart' ? cartCount : t.id === 'favorites' ? favCount : 0;
        const on = active === t.id;
        return (
          <button key={t.id} className={`bn-item ${on ? 'is-active' : ''}`} onClick={() => switchTab(t.id)} aria-current={on ? 'page' : undefined}>
            <span className="bn-icon">
              <Icon name={t.icon} size={23} filled={on && t.id === 'favorites'} strokeWidth={on ? 1.9 : 1.6} />
              {count > 0 && <span className="bn-count">{count > 99 ? '99+' : count}</span>}
            </span>
            <span className="bn-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function ToastHost() {
  const t = useToast((s) => s.toast);
  const hide = useToast((s) => s.hide);
  if (!t) return null;
  return (
    <div className={`toast ${t.tone === 'error' ? 'is-error' : ''}`} role="status" key={t.id}>
      <Icon name={t.tone === 'error' ? 'info' : 'check'} size={18} />
      <span>{t.text}</span>
      {t.action && (
        <button
          onClick={() => {
            t.action!.run();
            hide();
          }}
        >
          {t.action.label}
        </button>
      )}
    </div>
  );
}

export function QuickAddSheet() {
  const id = useQuickAdd((s) => s.productId);
  const close = useQuickAdd((s) => s.close);
  const product = useProduct(id ?? '');
  const [sel, setSel] = useState<Selection>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (product) setSel(defaultSelection(product));
    setTried(false);
  }, [product]);

  if (!product) return null;
  const { price, oldPrice } = priceFor(product, sel);
  const colorIdx = product.options.find((g) => g.id === 'color')?.values.find((v) => v.id === sel.color)?.imageIndex;

  return (
    <Sheet
      open
      onClose={close}
      title="Оберіть варіант"
      footer={
        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            setTried(true);
            if (addProductToCart(product, sel)) close();
          }}
        >
          <Icon name="bag" size={20} />
          Додати в кошик
        </button>
      }
    >
      <div className="qa-head">
        <ProductImage src={product.images[colorIdx ?? 0]} alt={product.name} className="qa-img" />
        <div>
          <span className="card-brand">{product.brand}</span>
          <h3 className="qa-name">{product.name}</h3>
          <Price price={price} oldPrice={oldPrice} />
          <span className={`stock stock-${product.stock}`}>
            <i />
            {stockLabel[product.stock]}
          </span>
        </div>
      </div>
      <OptionPicker product={product} selection={sel} onChange={setSel} highlightMissing={tried} compact />
    </Sheet>
  );
}
