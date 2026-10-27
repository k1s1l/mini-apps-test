// Перевірка полів форми замовлення.

/** Повертає номер у форматі +380XXXXXXXXX або null, якщо номер некоректний. */
export function normalizeUaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  let local: string;
  if (digits.startsWith('380') && digits.length === 12) local = digits.slice(3);
  else if (digits.startsWith('0') && digits.length === 10) local = digits.slice(1);
  else if (digits.length === 9) local = digits;
  else return null;
  // Коди мобільних і стаціонарних операторів України починаються з 3–9.
  if (!/^[3-9]\d{8}$/.test(local)) return null;
  return `+380${local}`;
}

/** Маска введення: +380 XX XXX XX XX */
export function formatPhoneInput(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.length ? `+380 ${parts.join(' ')}` : input.trim() === '' ? '' : '+380 ';
}

export function validateFullName(v: string): string | null {
  const t = v.trim();
  if (!t) return "Вкажіть ім'я та прізвище";
  const words = t.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length < 2) return "Потрібні і ім'я, і прізвище";
  if (!/^[\p{L}\s'’ʼ-]+$/u.test(t)) return 'Використовуйте лише літери';
  return null;
}

export function validatePhone(v: string): string | null {
  if (!v.replace(/\D/g, '').replace(/^380/, '')) return 'Вкажіть номер телефону';
  return normalizeUaPhone(v) ? null : 'Номер має бути у форматі +380 XX XXX XX XX';
}

export function validateRequired(v: string, message: string): string | null {
  return v.trim().length >= 2 ? null : message;
}
