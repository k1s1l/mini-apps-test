// Оформлення замовлення.
// Серверної частини ще немає, тому submitOrder працює в демонстраційному режимі:
// нічого не надсилає і нічого не зберігає. Після появи бекенду тут буде
// POST-запит, а сервер:
//   1) перевіряє initData Telegram (підпис ключем бота);
//   2) перераховує ціни за власним каталогом (ціни з клієнта не довіряються);
//   3) зберігає замовлення та надсилає повідомлення адміністратору через бота;
//   4) за потреби створює платіж і ТТН у службі доставки.

export type DeliveryMethod = 'np_branch' | 'np_locker' | 'ukrposhta' | 'courier';

export interface OrderLine {
  productId: string;
  name: string;
  brand: string;
  selection: Record<string, string>;
  selectionLabel: string;
  qty: number;
  unitPrice: number;
}

export interface OrderDraft {
  customer: { fullName: string; phone: string };
  delivery: { city: string; method: DeliveryMethod; point: string };
  comment: string;
  lines: OrderLine[];
  total: number;
  /** Сирий рядок initData з Telegram — сервер має перевірити його підпис. */
  telegramInitData?: string;
}

export type OrderResult =
  | { mode: 'demo'; reference: string }
  | { mode: 'live'; orderId: string };

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export async function submitOrder(draft: OrderDraft): Promise<OrderResult> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error(`Сервер відповів з помилкою ${res.status}`);
    const data = (await res.json()) as { orderId: string };
    return { mode: 'live', orderId: data.orderId };
  }
  await new Promise((r) => setTimeout(r, 900));
  // Номер лише для відображення в демо, ніде не зберігається.
  const reference = `ДЕМО-${Date.now().toString().slice(-6)}`;
  return { mode: 'demo', reference };
}
