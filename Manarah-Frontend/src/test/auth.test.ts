import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePassword } from '../utils/validators'
import { api, request } from '../services/api'

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string) { return this.store.get(key) ?? null }
  setItem(key: string, value: string) { this.store.set(key, String(value)) }
  removeItem(key: string) { this.store.delete(key) }
  clear() { this.store.clear() }
}

const mockLocalStorage = new MemoryStorage()
const mockSessionStorage = new MemoryStorage()
Object.assign(globalThis, { localStorage: mockLocalStorage, sessionStorage: mockSessionStorage })
// @ts-ignore
global.localStorage = mockLocalStorage
// @ts-ignore
global.sessionStorage = mockSessionStorage

describe('Auth Services & Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockLocalStorage.clear()
    mockSessionStorage.clear()
  })

  describe('validatePassword', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Pass1')
      expect(res.isValid).toBe(false)
      expect(res.hasMinLength).toBe(false)
      expect(res.errorMessage).toContain('8 خانات')
    })

    it('rejects passwords without numbers', () => {
      const res = validatePassword('PasswordOnly')
      expect(res.isValid).toBe(false)
      expect(res.hasNumber).toBe(false)
      expect(res.errorMessage).toContain('أحرف وأرقام معاً')
    })

    it('rejects passwords without letters', () => {
      const res = validatePassword('123456789')
      expect(res.isValid).toBe(false)
      expect(res.hasLetter).toBe(false)
    })

    it('accepts compliant passwords with letters and numbers', () => {
      const res = validatePassword('SecurePass2026')
      expect(res.isValid).toBe(true)
      expect(res.hasMinLength).toBe(true)
      expect(res.hasNumber).toBe(true)
      expect(res.hasLetter).toBe(true)
      expect(res.errorMessage).toBeUndefined()
    })
  })

  describe('API login & verifyEmail flow', () => {
    it('stores token upon successful email verification', async () => {
      const mockResponse = {
        token: 'test-token-xyz',
        user: { id: 1, name: 'أحمد', email: 'ahmed@example.com', role: 'GRADUATE', email_verified: true },
        message: 'تم تفعيل الحساب بنجاح',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      } as Response)

      const result = await api.verifyEmail('123456', 'ahmed@example.com')
      expect(result.success).toBe(true)
      expect(result.token).toBe('test-token-xyz')
      expect(mockLocalStorage.getItem('manarah_token')).toBe('test-token-xyz')
    })

    it('clears storage and redirects on 401 unauthenticated response', async () => {
      mockLocalStorage.setItem('manarah_token', 'expired-token')
      mockLocalStorage.setItem('manarah_user_role', 'GRADUATE')

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'التوكن غير صالح أو منتهي الصلاحية' }),
      } as Response)

      await expect(request('/profiles/graduate/me/')).rejects.toThrow()
      expect(mockLocalStorage.getItem('manarah_token')).toBeNull()
      expect(mockLocalStorage.getItem('manarah_user_role')).toBeNull()
    })
  })
})
