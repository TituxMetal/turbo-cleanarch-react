import { Email } from './email.vo'

describe('Email', () => {
  describe('constructor', () => {
    it('should create email with valid format', () => {
      const email = new Email('test@example.com')

      expect(email.getValue()).toBe('test@example.com')
    })

    it('should accept email with subdomains', () => {
      const email = new Email('user@subdomain.example.com')

      expect(email.getValue()).toBe('user@subdomain.example.com')
    })

    it('should accept email with numbers', () => {
      const email = new Email('user123@example123.com')

      expect(email.getValue()).toBe('user123@example123.com')
    })

    it('should accept email with special characters', () => {
      const email = new Email('user.name+tag@example.com')

      expect(email.getValue()).toBe('user.name+tag@example.com')
    })

    it('should throw error for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format')
    })

    it('should throw error for email without @', () => {
      expect(() => new Email('useratexample.com')).toThrow('Invalid email format')
    })

    it('should throw error for email without domain', () => {
      expect(() => new Email('user@')).toThrow('Invalid email format')
    })

    it('should throw error for email without local part', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email format')
    })

    it('should throw error for email without TLD', () => {
      expect(() => new Email('user@example')).toThrow('Invalid email format')
    })

    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email format')
    })

    it('should throw error for email with spaces', () => {
      expect(() => new Email('user @example.com')).toThrow('Invalid email format')
    })

    it('should throw error for multiple @ symbols', () => {
      expect(() => new Email('user@@example.com')).toThrow('Invalid email format')
    })
  })

  describe('equals', () => {
    it('should return true for same email values', () => {
      const email1 = new Email('test@example.com')
      const email2 = new Email('test@example.com')

      expect(email1.equals(email2)).toBe(true)
    })

    it('should return false for different email values', () => {
      const email1 = new Email('test1@example.com')
      const email2 = new Email('test2@example.com')

      expect(email1.equals(email2)).toBe(false)
    })

    it('should be case sensitive', () => {
      const email1 = new Email('Test@Example.com')
      const email2 = new Email('test@example.com')

      expect(email1.equals(email2)).toBe(false)
    })
  })

  describe('immutability', () => {
    it('should be a value object (no identity)', () => {
      const email1 = new Email('test@example.com')
      const email2 = new Email('test@example.com')

      expect(email1).not.toBe(email2)
      expect(email1.equals(email2)).toBe(true)
    })
  })
})
