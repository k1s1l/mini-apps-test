// Дрібні елементи інтерфейсу, що повторюються на різних екранах.

import { useState, type ReactNode } from 'react';
import { imageUrl } from '../data/images';
import { discountPercent, formatPrice } from '../lib/format';
import { Icon } from './Icon';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Підпис для заглушки, коли фото ще немає (бренд над назвою). */
  brand?: string;
}

export function ProductImage({ src, alt, className, brand }: ProductImageProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const url = imageUrl(src);
  if (!src)
    return (
      <div className={`pimg is-empty ${className ?? ''}`} role="img" aria-label={`${alt} — фото незабаром`}>
        <div className="pimg-plate">
          {brand && <span className="pimg-brand">{brand}</span>}
          <span className="pimg-name">{brand && alt.startsWith(brand) ? alt.slice(brand.length).trim() || alt : alt}</span>
          <span className="pimg-soon">фото незабаром</span>
        </div>
      </div>
    );
  return (
    <div className={`pimg ${className ?? ''} is-${url ? state : 'error'}`}>
      {url && state !== 'error' && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
        />
      )}
      {(!url || state === 'error') && (
        <div className="pimg-fallback">
          <Icon name="box" size={28} />
          <span>Фото недоступне</span>
        </div>
      )}
    </div>
  );
}

export function Price({ price, oldPrice, from, size = 'md' }: { price: number; oldPrice?: number; from?: boolean; size?: 'md' | 'lg' }) {
  const off = discountPercent(price, oldPrice);
  return (
    <div className={`price price-${size}`}>
      <span className={`price-now ${off ? 'is-sale' : ''}`}>
        {from && <span className="price-from">від </span>}
        {formatPrice(price)}
      </span>
      {off > 0 && <span className="price-old">{formatPrice(oldPrice!)}</span>}
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange(v: number): void; min?: number; max?: number }) {
  return (
    <div className="stepper" role="group" aria-label="Кількість">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Зменшити">
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Збільшити">
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

export function EmptyState({ icon, title, text, children }: { icon: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={30} strokeWidth={1.4} />
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}

export function TopBar({ title, onBack, right, sub }: { title?: string; onBack?: () => void; right?: ReactNode; sub?: string }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Назад">
          <Icon name="back" />
        </button>
      ) : (
        <span className="icon-btn-spacer" />
      )}
      <div className="topbar-title">
        {title && <h1>{title}</h1>}
        {sub && <span>{sub}</span>}
      </div>
      <div className="topbar-right">{right ?? <span className="icon-btn-spacer" />}</div>
    </header>
  );
}

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose(): void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрити">
            <Icon name="close" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action && (
        <button className="link-btn" onClick={onAction}>
          {action}
          <Icon name="chevron" size={16} />
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}
