export type BookPurchaseApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const bookCheckoutEnabled = import.meta.env.VITE_ENABLE_BOOK_CHECKOUT === 'true';
const checkoutComingSoonMessage = 'Online checkout is coming soon. Please reach out to request a copy.';

export async function getBookPurchaseQuote<T = unknown>(payload: unknown): Promise<BookPurchaseApiResult<T>> {
  if (!bookCheckoutEnabled) return checkoutDisabledResult<T>();
  return postBookPurchaseRequest<T>('/api/book-purchases/quote', payload);
}

export async function createBookPurchase<T = unknown>(payload: unknown): Promise<BookPurchaseApiResult<T>> {
  if (!bookCheckoutEnabled) return checkoutDisabledResult<T>();
  return postBookPurchaseRequest<T>('/api/book-purchases/create', payload);
}

async function postBookPurchaseRequest<T>(endpoint: string, payload: unknown): Promise<BookPurchaseApiResult<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (!response.ok) {
      return {
        ok: false,
        error: publicBookPurchaseError(data),
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      error: 'Book purchasing is not available right now. Please try again soon.',
    };
  }
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function publicBookPurchaseError(data: unknown) {
  if (isRecord(data)) {
    const message = data.error;
    if (typeof message === 'string' && message.trim()) {
      if (message.trim().toLowerCase() === 'not found') {
        return checkoutComingSoonMessage;
      }

      return message.trim();
    }
  }

  return checkoutComingSoonMessage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkoutDisabledResult<T>(): BookPurchaseApiResult<T> {
  return {
    ok: false,
    error: checkoutComingSoonMessage,
  };
}
