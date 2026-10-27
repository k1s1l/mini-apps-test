import { useEffect } from 'react';
import { Icon } from './components/Icon';
import { BottomNav, QuickAddSheet, ToastHost } from './components/Shell';
import { EmptyState, Skeleton } from './components/ui';
import { CartScreen } from './screens/CartScreen';
import { CatalogScreen, CategoryScreen, CollectionScreen } from './screens/CatalogScreens';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { HomeScreen } from './screens/HomeScreen';
import { FavoritesScreen, ProfileScreen, SuccessScreen } from './screens/OtherScreens';
import { ProductScreen } from './screens/ProductScreen';
import { SearchScreen } from './screens/SearchScreen';
import { telegram } from './services/telegram';
import { useCatalog } from './store/catalog';
import { useNav, useRoute, type Route } from './store/nav';
import { useToast } from './store/toast';

function renderRoute(r: Route) {
  switch (r.name) {
    case 'home':
      return <HomeScreen />;
    case 'catalog':
      return <CatalogScreen />;
    case 'favorites':
      return <FavoritesScreen />;
    case 'cart':
      return <CartScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'category':
      return <CategoryScreen categoryId={r.categoryId} subId={r.subId} />;
    case 'collection':
      return <CollectionScreen tag={r.tag} />;
    case 'search':
      return <SearchScreen initial={r.query} />;
    case 'product':
      return <ProductScreen productId={r.productId} />;
    case 'checkout':
      return <CheckoutScreen />;
    case 'success':
      return <SuccessScreen reference={r.reference} total={r.total} count={r.count} />;
  }
}

const FULLSCREEN: Route['name'][] = ['product', 'checkout', 'success'];

export default function App() {
  const { status, load } = useCatalog();
  const entry = useRoute();
  const depth = useNav((s) => s.stack.length);
  const direction = useNav((s) => s.direction);
  const back = useNav((s) => s.back);

  useEffect(() => {
    load();
  }, [load]);

  // Старі сповіщення не переносимо на інший екран (свіжі, з дією «До кошика», лишаються).
  useEffect(() => {
    const t = useToast.getState().toast;
    if (t && Date.now() - t.id > 400) useToast.getState().hide();
  }, [entry.id]);

  // Системна кнопка «Назад» у Telegram.
  useEffect(() => telegram.backButton(depth > 1, back), [depth, back]);

  const withNav = !FULLSCREEN.includes(entry.route.name);

  return (
    <div className={`app ${withNav ? 'has-nav' : ''}`}>
      <main className={`view view-${direction}`} key={entry.id}>
        {status === 'ready' ? (
          renderRoute(entry.route)
        ) : status === 'error' ? (
          <EmptyState icon="refresh" title="Не вдалося завантажити каталог" text="Перевірте з’єднання з інтернетом і спробуйте ще раз.">
            <button className="btn btn-primary" onClick={load}>
              Спробувати ще раз
            </button>
          </EmptyState>
        ) : (
          <LoadingScreen />
        )}
      </main>
      {withNav && <BottomNav />}
      <QuickAddSheet />
      <ToastHost />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="screen loading" aria-busy="true" aria-label="Завантаження каталогу">
      <div className="home-bar">
        <div className="logo">
          <span className="logo-mark">КРАМ</span>
          <span className="logo-sub">мультикаталог</span>
        </div>
        <Icon name="search" />
      </div>
      <Skeleton className="sk-hero" />
      <Skeleton className="sk-line" />
      <div className="cat-rail">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="sk-cat" />
        ))}
      </div>
      <div className="grid">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="sk-card" />
        ))}
      </div>
    </div>
  );
}
