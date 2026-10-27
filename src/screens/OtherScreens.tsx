import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, TopBar } from '../components/ui';
import { shopConfig } from '../config/shop';
import { formatPrice, itemsLabel } from '../lib/format';
import { telegram } from '../services/telegram';
import { useProducts } from '../store/catalog';
import { useNav } from '../store/nav';
import { useShop } from '../store/shop';

export function FavoritesScreen() {
  const favorites = useShop((s) => s.favorites);
  const products = useProducts();
  const switchTab = useNav((s) => s.switchTab);
  const items = useMemo(
    () => favorites.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p),
    [favorites, products],
  );

  return (
    <div className="screen">
      <TopBar title="Обране" sub={items.length ? itemsLabel(items.length) : undefined} />
      {items.length ? (
        <div className="grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon="heart" title="Тут поки порожньо" text="Натискайте на сердечко на товарах, які сподобались, — вони з’являться тут.">
          <button className="btn btn-primary" onClick={() => switchTab('catalog')}>
            Перейти до каталогу
          </button>
        </EmptyState>
      )}
    </div>
  );
}

export function SuccessScreen({ reference, total, count }: { reference: string; total: number; count: number }) {
  const switchTab = useNav((s) => s.switchTab);
  return (
    <div className="screen success">
      <div className="success-mark">
        <Icon name="check" size={40} strokeWidth={2} />
      </div>
      <h1>Демо-замовлення оформлено</h1>
      <p className="success-lead">
        Так виглядатиме підтвердження для покупця. У демоверсії замовлення нікуди не надсилається і ніде не зберігається, оплата не здійснюється.
      </p>
      <dl className="success-facts">
        <div>
          <dt>Номер (демо)</dt>
          <dd>{reference}</dd>
        </div>
        <div>
          <dt>Товари</dt>
          <dd>{itemsLabel(count)}</dd>
        </div>
        <div>
          <dt>Сума</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="hint">Після підключення сервера тут з’явиться справжній номер замовлення, а менеджер отримає сповіщення в Telegram.</p>
      <button className="btn btn-primary btn-block" onClick={() => switchTab('home')}>
        Повернутися до покупок
      </button>
    </div>
  );
}

export function ProfileScreen() {
  const user = telegram.user;
  const switchTab = useNav((s) => s.switchTab);
  const favCount = useShop((s) => s.favorites.length);
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const c = shopConfig.contacts;
  const contacts = [
    { icon: 'phone', label: 'Телефон', value: c.phone },
    { icon: 'send', label: 'Telegram', value: c.telegram },
    { icon: 'mail', label: 'Ел. пошта', value: c.email },
    { icon: 'clock', label: 'Графік роботи', value: c.hours },
  ].filter((x) => x.value);
  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'Гість';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="screen profile">
      <TopBar title="Профіль" />
      <section className="profile-card">
        {user?.photo_url ? <img src={user.photo_url} alt="" className="avatar" /> : <div className="avatar">{initials}</div>}
        <div>
          <h2>{name}</h2>
          {user ? (
            <p>{user.username ? `@${user.username}` : 'Користувач Telegram'}</p>
          ) : (
            <p>Відкрийте магазин через Telegram, щоб побачити свій профіль</p>
          )}
        </div>
      </section>
      {user && (
        <p className="hint">
          Дані профілю отримано з Telegram і показано лише для зручності. Для замовлень сервер перевірятиме їх окремо.
        </p>
      )}

      <div className="profile-stats">
        <button onClick={() => switchTab('favorites')}>
          <b>{favCount}</b>
          <span>в обраному</span>
        </button>
        <button onClick={() => switchTab('cart')}>
          <b>{cartCount}</b>
          <span>у кошику</span>
        </button>
      </div>

      <section className="co-section">
        <h2>Мої замовлення</h2>
        <div className="info-box">
          <Icon name="box" size={22} />
          <p>Історія замовлень з’явиться після підключення сервера. Демо-замовлення не зберігаються.</p>
        </div>
      </section>

      <section className="co-section">
        <h2>Контакти магазину</h2>
        {contacts.length ? (
          <ul className="contact-list">
            {contacts.map((x) => (
              <li key={x.label}>
                <Icon name={x.icon} size={20} />
                <span>{x.label}</span>
                <b>{x.value}</b>
              </li>
            ))}
          </ul>
        ) : (
          <div className="info-box">
            <Icon name="phone" size={22} />
            <p>Контактні дані магазину буде додано перед запуском.</p>
          </div>
        )}
      </section>

      <section className="co-section">
        <h2>Корисне</h2>
        <ul className="faq">
          <li>
            <Icon name="truck" size={20} />
            <div>
              <b>Доставка</b>
              <span>Нова пошта (відділення та поштомати), Укрпошта, кур’єр.</span>
            </div>
          </li>
          <li>
            <Icon name="shield" size={20} />
            <div>
              <b>Оплата</b>
              <span>Зараз — при отриманні. Онлайн-оплату буде додано пізніше.</span>
            </div>
          </li>
        </ul>
      </section>

      <button className="btn btn-outline btn-block" onClick={() => switchTab('catalog')}>
        Повернутися до каталогу
      </button>
      <p className="version">{shopConfig.name} · демоверсія 0.1</p>
    </div>
  );
}
