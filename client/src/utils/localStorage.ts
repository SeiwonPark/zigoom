/**
 * NOTE: localStorage API has no data expiration time and it can store up to 5MB.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#api.window.localstorage}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 */
import { Unnamed } from '@/assets/images'
import { toDataURL } from '@/utils/string'
import { GoogleJWTPayload } from '@/validations/auth.validation'

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
 * @returns {T | null} The retrieved item if exists, or null is returned.
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key)
  return item ? (JSON.parse(item) as T) : null
}

/**
 * Retrieves user's profile image from the browser's localStorage.
 *
 * @returns {Promise<string>} Returns user's profile image.
 */
export const getProfileImage = async (): Promise<string> => {
  const unnamed = await toDataURL(Unnamed)
  const localUserData = getLocalStorageItem<GoogleJWTPayload>('user')

  if (localUserData) {
    const localProfile = await toDataURL(localUserData.picture.replace('=s96-c', '=l96-c')) // FIXME: seems tricky
    return localProfile
  }

  return unnamed
}
