import { UserId } from './id.vo'

describe('UserId', () => {
  describe('constructor', () => {
    it('should create a new unique ID when no value provided', () => {
      const id = new UserId()

      expect(id.getValue()).toBeDefined()
      expect(typeof id.getValue()).toBe('string')
      expect(id.getValue().length).toBeGreaterThan(0)
    })

    it('should create ID with provided value', () => {
      const customId = 'custom-id-123'
      const id = new UserId(customId)

      expect(id.getValue()).toBe(customId)
    })

    it('should generate different IDs for multiple instances', () => {
      const id1 = new UserId()
      const id2 = new UserId()

      expect(id1.getValue()).not.toBe(id2.getValue())
    })

    it('should generate UUID format by default', () => {
      const id = new UserId()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(uuidRegex.test(id.getValue())).toBe(true)
    })
  })

  describe('getValue', () => {
    it('should return the ID value', () => {
      const customId = 'test-id-123'
      const id = new UserId(customId)

      expect(id.getValue()).toBe(customId)
    })
  })

  describe('equals', () => {
    it('should return true for same ID values', () => {
      const idValue = 'same-id-123'
      const id1 = new UserId(idValue)
      const id2 = new UserId(idValue)

      expect(id1.equals(id2)).toBe(true)
    })

    it('should return false for different ID values', () => {
      const id1 = new UserId('id-123')
      const id2 = new UserId('id-456')

      expect(id1.equals(id2)).toBe(false)
    })

    it('should return false for auto-generated IDs', () => {
      const id1 = new UserId()
      const id2 = new UserId()

      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('immutability', () => {
    it('should have readonly value property', () => {
      const id = new UserId('original-id')

      expect(id.getValue()).toBe('original-id')
    })

    it('should be a value object (no identity)', () => {
      const idValue = 'same-id'
      const id1 = new UserId(idValue)
      const id2 = new UserId(idValue)

      expect(id1).not.toBe(id2)
      expect(id1.equals(id2)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should generate UUID when empty string provided', () => {
      const id = new UserId('')
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(uuidRegex.test(id.getValue())).toBe(true)
    })

    it('should handle numeric string ID', () => {
      const id = new UserId('12345')

      expect(id.getValue()).toBe('12345')
    })

    it('should handle special characters in ID', () => {
      const specialId = 'id-with-special@characters#123'
      const id = new UserId(specialId)

      expect(id.getValue()).toBe(specialId)
    })
  })
})
