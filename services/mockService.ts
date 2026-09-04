const STORAGE_PREFIX = "educenter_";

export async function mockRequest<T>(
  data: T,
  delay = 150,
): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return structuredClone(data);
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(data),
    );
  } catch (error) {
    console.warn(
      `Failed to save ${key} to localStorage:`,
      error,
    );
  }
}

export function loadFromStorage<T>(
  key: string,
  defaultValue: T,
): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const stored = window.localStorage.getItem(
      `${STORAGE_PREFIX}${key}`,
    );

    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.warn(
      `Failed to load ${key} from localStorage:`,
      error,
    );
  }

  return defaultValue;
}

export function clearStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      `${STORAGE_PREFIX}${key}`,
    );
  } catch (error) {
    console.warn(
      `Failed to clear ${key} from localStorage:`,
      error,
    );
  }
}