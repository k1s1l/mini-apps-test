import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { EmptyState, ProductImage, TopBar } from '../components/ui';
import { resolveCart } from '../lib/cart';
import { formatPrice, itemsLabel } from '../lib/format';
import { formatPhoneInput, normalizeUaPhone, validateFullName, validatePhone, validateRequired } from '../lib/validation';
import { submitOrder, type DeliveryMethod } from '../services/orderService';
import { telegram } from '../services/telegram';
import { useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop } from '../store/shop';
import { toast } from '../store/toast';

const methods: { id: DeliveryMethod; label: string; hint: string; point?: { label: string; placeholder: string } }[] = [
  { id: 'np_branch', label: 'Нова пошта — відділення', hint: '1–3 дні', point: { label: 'Номер відділення', placeholder: 'Наприклад, Відділення №12' } },
  { id: 'np_locker', label: 'Нова пошта — поштомат', hint: '1–3 дні', point: { label: 'Номер поштомата', placeholder: 'Наприклад, Поштомат №5521' } },
  { id: 'ukrposhta', label: 'Укрпошта — відділення', hint: '3–5 днів', point: { label: 'Індекс або номер відділення', placeholder: 'Наприклад, 01001' } },
  { id: 'courier', label: 'Кур’єр за адресою', hint: 'у великих містах', point: { label: 'Адреса доставки', placeholder: 'Вулиця, будинок, квартира' } },
];

type Field = 'fullName' | 'phone' | 'city' | 'point';

export function CheckoutScreen() {
  const cart = useShop((s) => s.cart);
  const draft = useShop((s) => s.draft);
  const updateDraft = useShop((s) => s.updateDraft);
  const clearCart = useShop((s) => s.clearCart);
  const products = useProducts();
  const back = useNav((s) => s.back);
  const switchTab = useNav((s) => s.switchTab);
  const push = useNav((s) => s.push);
  const summary = useMemo(() => resolveCart(cart, products), [cart, products]);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const method = methods.find((m) => m.id === draft.method) ?? methods[0];
  const errors: Record<Field, string | null> = {
    fullName: validateFullName(draft.fullName),
    phone: validatePhone(draft.phone),
    city: validateRequired(draft.city, 'Вкажіть місто або населений пункт'),
    point: validateRequired(draft.point, draft.method === 'courier' ? 'Вкажіть адресу доставки' : `Вкажіть: ${method.point!.label.toLowerCase()}`),
  };
  const show = (f: Field) => (submitted || touched[f]) && errors[f];
  const valid = Object.values(errors).every((e) => !e);

  if (!summary.count)
    return (
      <div className="screen">
        <TopBar title="Оформлення" onBack={back} />
        <EmptyState icon="bag" title="Немає товарів для оформлення" text="Додайте товари в кошик, щоб оформити замовлення.">
          <button className="btn btn-primary" onClick={() => switchTab('catalog')}>
            Перейти до покупок
          </button>
        </EmptyState>
      </div>
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSendError(null);
    if (!valid) {
      telegram.haptic('error');
      toast('Перевірте виділені поля', { tone: 'error' });
      const first = (['fullName', 'phone', 'city', 'point'] as Field[]).find((f) => errors[f]);
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    if (summary.hasUnavailable) {
      toast('У кошику є товари, яких немає в наявності', { tone: 'error' });
      return;
    }
    setSending(true);
    try {
      const result = await submitOrder({
        customer: { fullName: draft.fullName.trim(), phone: normalizeUaPhone(draft.phone)! },
        delivery: { city: draft.city.trim(), method: draft.method, point: draft.point.trim() },
        comment: draft.comment.trim(),
        lines: summary.lines
          .filter((l) => l.available && l.product)
          .map((l) => ({
            productId: l.product!.id,
            name: l.product!.name,
            brand: l.product!.brand,
            selection: l.item.selection,
            selectionLabel: l.label,
            qty: l.item.qty,
            unitPrice: l.unitPrice,
          })),
        total: summary.total,
        telegramInitData: telegram.initData,
      });
      telegram.haptic('success');
      const reference = result.mode === 'demo' ? result.reference : result.orderId;
      const total = summary.total;
      const count = summary.count;
      clearCart();
      updateDraft({ comment: '' });
      // Замінюємо стек, щоб «Назад» не повертав до порожньої форми.
      switchTab('cart');
      push({ name: 'success', reference, total, count });
    } catch (err) {
      telegram.haptic('error');
      setSendError(err instanceof Error ? err.message : 'Не вдалося надіслати замовлення');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="screen checkout">
      <TopBar title="Оформлення" sub={itemsLabel(summary.count)} onBack={back} />

      <div className="demo-note is-strong">
        <Icon name="info" size={18} />
        <span>
          Демонстраційне оформлення. Замовлення не передається продавцю, оплата не списується.
        </span>
      </div>

      <form className="co-form" onSubmit={onSubmit} noValidate>
        <section className="co-section">
          <h2>Контактні дані</h2>
          <TextField
            id="co-fullName"
            label="Ім’я та прізвище"
            value={draft.fullName}
            onChange={(v) => updateDraft({ fullName: v })}
            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            error={show('fullName')}
            autoComplete="name"
            placeholder="Олена Коваль"
          />
          <TextField
            id="co-phone"
            label="Номер телефону"
            value={draft.phone}
            onChange={(v) => updateDraft({ phone: formatPhoneInput(v) })}
            onFocus={() => !draft.phone && updateDraft({ phone: '+380 ' })}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={show('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+380 XX XXX XX XX"
          />
        </section>

        <section className="co-section">
          <h2>Доставка</h2>
          <TextField
            id="co-city"
            label="Місто"
            value={draft.city}
            onChange={(v) => updateDraft({ city: v })}
            onBlur={() => setTouched((t) => ({ ...t, city: true }))}
            error={show('city')}
            autoComplete="address-level2"
            placeholder="Київ"
          />
          <div className="radio-list" role="radiogroup" aria-label="Спосіб доставки">
            {methods.map((m) => (
              <label key={m.id} className={`radio-row ${draft.method === m.id ? 'is-on' : ''}`}>
                <input
                  type="radio"
                  name="delivery"
                  id={`co-method-${m.id}`}
                  checked={draft.method === m.id}
                  onChange={() => {
                    updateDraft({ method: m.id, point: '' });
                    setTouched((t) => ({ ...t, point: false }));
                  }}
                />
                <i className="radio" />
                <span>
                  {m.label}
                  <small>{m.hint}</small>
                </span>
              </label>
            ))}
          </div>
          <TextField
            id="co-point"
            label={method.point!.label}
            value={draft.point}
            onChange={(v) => updateDraft({ point: v })}
            onBlur={() => setTouched((t) => ({ ...t, point: true }))}
            error={show('point')}
            placeholder={method.point!.placeholder}
          />
          <p className="hint">Пошук відділень з’явиться після підключення API служби доставки.</p>
        </section>

        <section className="co-section">
          <h2>Оплата</h2>
          <div className="radio-list">
            <label className="radio-row is-on">
              <input type="radio" name="payment" id="co-pay-cod" defaultChecked />
              <i className="radio" />
              <span>
                Оплата при отриманні
                <small>накладений платіж</small>
              </span>
            </label>
            <label className="radio-row is-disabled">
              <input type="radio" name="payment" id="co-pay-online" disabled />
              <i className="radio" />
              <span>
                Онлайн-оплата карткою
                <small>буде доступна після підключення платіжної системи</small>
              </span>
            </label>
          </div>
        </section>

        <section className="co-section">
          <h2>Коментар</h2>
          <label className="field">
            <textarea
              id="co-comment"
              rows={3}
              maxLength={500}
              placeholder="Побажання щодо замовлення або доставки"
              value={draft.comment}
              onChange={(e) => updateDraft({ comment: e.target.value })}
            />
          </label>
        </section>

        <section className="co-section">
          <h2>Ваше замовлення</h2>
          <ul className="co-lines">
            {summary.lines
              .filter((l) => l.product)
              .map((l) => (
                <li key={l.item.key}>
                  <ProductImage src={l.product!.images[0]} alt={l.product!.name} className="co-thumb" />
                  <div>
                    <b>{l.product!.name}</b>
                    <small>{[l.label, `${l.item.qty} шт.`].filter(Boolean).join(' · ')}</small>
                  </div>
                  <span>{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
          </ul>
          <div className="summary">
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
              <span>До сплати</span>
              <span>{formatPrice(summary.total)}</span>
            </div>
          </div>
        </section>

        {sendError && (
          <p className="warn-note is-error">
            <Icon name="info" size={18} />
            {sendError}. Спробуйте ще раз.
          </p>
        )}

        <div className="buy-bar">
          <div className="buy-bar-total">
            <span>До сплати</span>
            <b>{formatPrice(summary.total)}</b>
          </div>
          <button className="btn btn-primary btn-grow" type="submit" disabled={sending}>
            {sending ? <span className="spinner" aria-label="Надсилання" /> : 'Підтвердити замовлення'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange(v: string): void;
  error?: string | null | false;
}

function TextField({ id, label, value, onChange, error, ...rest }: TextFieldProps) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span className="field-label">{label}</span>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
