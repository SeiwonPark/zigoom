/**
 * NOTE: localStorage API has no data expiration time and it can store up to 5MB.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#api.window.localstorage}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 */

/**
 * Stores the given payload in the browser's localStorage.
 *
 * @template T - The type of the payload.
 * @param {string} key - The key of the payload.
 * @param {T} payload - The data to be stored in localStorage.
 */
export const storeDataInLocalStorage = <T>(key: string, payload: T): void => {
  localStorage.setItem(key, JSON.stringify(payload))
}

/**
 * Retrieves a specific item from the browser's localStorage.
 *
 * @template T - The expected type of the item.
 * @param {string} key - The key of the item to retrieve.
 * @returns {T | null} - The retrieved item if exists, or null is returned.
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key)
  return item ? (JSON.parse(item) as T) : null
}
