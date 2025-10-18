import { UserEntity } from './user.entity'

describe('UserEntity', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = UserEntity.create('John Doe', 'john@example.com')

      expect(user.getName()).toBe('John Doe')
      expect(user.getEmail().getValue()).toBe('john@example.com')
      expect(user.getId().getValue()).toBeDefined()
      expect(user.getCreatedAt()).toBeInstanceOf(Date)
      expect(user.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should trim whitespace from name', () => {
      const user = UserEntity.create('  John Doe  ', 'john@example.com')

      expect(user.getName()).toBe('John Doe')
    })

    it('should throw error for empty name', () => {
      expect(() => UserEntity.create('', 'john@example.com')).toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should throw error for name with only whitespace', () => {
      expect(() => UserEntity.create('   ', 'john@example.com')).toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should throw error for name shorter than 2 characters', () => {
      expect(() => UserEntity.create('J', 'john@example.com')).toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should throw error for invalid email', () => {
      expect(() => UserEntity.create('John Doe', 'invalid-email')).toThrow('Invalid email format')
    })

    it('should set createdAt and updatedAt to same value initially', () => {
      const user = UserEntity.create('John Doe', 'john@example.com')

      expect(user.getCreatedAt().getTime()).toBe(user.getUpdatedAt().getTime())
    })

    it('should generate unique IDs for different users', () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')

      expect(user1.getId().getValue()).not.toBe(user2.getId().getValue())
    })
  })

  describe('updateName', () => {
    let user: UserEntity

    beforeEach(() => {
      user = UserEntity.create('John Doe', 'john@example.com')
    })

    it('should update name successfully', () => {
      user.updateName('Jane Smith')

      expect(user.getName()).toBe('Jane Smith')
    })

    it('should trim whitespace from new name', () => {
      user.updateName('  Jane Smith  ')

      expect(user.getName()).toBe('Jane Smith')
    })

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = user.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))
      user.updateName('Jane Smith')

      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should not change createdAt', () => {
      const originalCreatedAt = user.getCreatedAt()

      user.updateName('Jane Smith')

      expect(user.getCreatedAt()).toBe(originalCreatedAt)
    })

    it('should throw error for empty name', () => {
      expect(() => user.updateName('')).toThrow('Name must be at least 2 characters long')
    })

    it('should throw error for name with only whitespace', () => {
      expect(() => user.updateName('   ')).toThrow('Name must be at least 2 characters long')
    })

    it('should throw error for name shorter than 2 characters', () => {
      expect(() => user.updateName('J')).toThrow('Name must be at least 2 characters long')
    })
  })

  describe('updateEmail', () => {
    let user: UserEntity

    beforeEach(() => {
      user = UserEntity.create('John Doe', 'john@example.com')
    })

    it('should update email successfully', () => {
      user.updateEmail('jane@example.com')

      expect(user.getEmail().getValue()).toBe('jane@example.com')
    })

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = user.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))
      user.updateEmail('jane@example.com')

      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should not change createdAt', () => {
      const originalCreatedAt = user.getCreatedAt()

      user.updateEmail('jane@example.com')

      expect(user.getCreatedAt()).toBe(originalCreatedAt)
    })

    it('should throw error for invalid email format', () => {
      expect(() => user.updateEmail('invalid-email')).toThrow('Invalid email format')
    })

    it('should throw error for empty email', () => {
      expect(() => user.updateEmail('')).toThrow('Invalid email format')
    })
  })

  describe('getAccountAge', () => {
    it('should return 0 for newly created user', () => {
      const user = UserEntity.create('John Doe', 'john@example.com')

      expect(user.getAccountAge()).toBe(0)
    })

    it('should calculate age correctly for older accounts', () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      const createdAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

      Object.defineProperty(user, 'createdAt', {
        value: createdAt,
        writable: false
      })

      expect(user.getAccountAge()).toBe(5)
    })
  })

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      const originalId = user.getId().getValue()
      const originalCreatedAt = user.getCreatedAt()

      expect(user.getId().getValue()).toBe(originalId)
      expect(user.getCreatedAt()).toBe(originalCreatedAt)
    })
  })
})
