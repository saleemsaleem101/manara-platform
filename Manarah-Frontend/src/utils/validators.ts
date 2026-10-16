/**
 * Shared validation rules for passwords and form fields
 * سبرنت 1: MNRA-48, MNRA-53
 */

export interface PasswordValidationResult {
  isValid: boolean
  hasMinLength: boolean
  hasNumber: boolean
  hasLetter: boolean
  errorMessage?: string
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password)

  let errorMessage: string | undefined
  if (!hasMinLength) {
    errorMessage = 'يجب ألا تقل كلمة المرور عن 8 خانات.'
  } else if (!hasNumber || !hasLetter) {
    errorMessage = 'يجب أن تشتمل كلمة المرور على أحرف وأرقام معاً.'
  }

  return {
    isValid: hasMinLength && hasNumber && hasLetter,
    hasMinLength,
    hasNumber,
    hasLetter,
    errorMessage,
  }
}

export interface NameValidationResult {
  isValid: boolean
  partCount: number
  errorMessage?: string
}

export function validateQuadrupleName(name: string): NameValidationResult {
  const trimmed = (name || '').trim()
  if (!trimmed) {
    return {
      isValid: false,
      partCount: 0,
      errorMessage: 'يرجى إدخال الاسم الرباعي كاملاً.',
    }
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length < 4) {
    return {
      isValid: false,
      partCount: parts.length,
      errorMessage: 'يجب إدخال الاسم الرباعي كاملاً على الأقل (أربعة أسماء مفصولة بمسافات).',
    }
  }

  return {
    isValid: true,
    partCount: parts.length,
  }
}
