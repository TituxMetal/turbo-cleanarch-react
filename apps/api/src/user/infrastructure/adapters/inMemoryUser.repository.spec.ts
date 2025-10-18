import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from './inMemoryUser.repository'

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository

  beforeEach(() => {
    repository = new InMemoryUserRepository()
  })

  describe('save', () => {
    it('should save a new user', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')

      const savedUser = await repository.save(user)

      expect(savedUser).toBe(user)
      expect(savedUser.getName()).toBe('John Doe')
      expect(savedUser.getEmail().getValue()).toBe('john@example.com')
    })

    it('should update an existing user', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)

      user.updateName('Jane Doe')
      const updatedUser = await repository.save(user)

      expect(updatedUser).toBe(user)
      expect(updatedUser.getName()).toBe('Jane Doe')
    })

    it('should handle multiple users', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('should find user by ID', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)
      const userId = user.getId().getValue()

      const foundUser = await repository.findById(userId)

      expect(foundUser).toBe(user)
      expect(foundUser?.getName()).toBe('John Doe')
    })

    it('should return null for non-existent ID', async () => {
      const foundUser = await repository.findById('non-existent-id')

      expect(foundUser).toBeNull()
    })

    it('should return null for empty ID', async () => {
      const foundUser = await repository.findById('')

      expect(foundUser).toBeNull()
    })

    it('should handle multiple users and return correct one', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const foundUser = await repository.findById(user2.getId().getValue())

      expect(foundUser).toBe(user2)
      expect(foundUser?.getName()).toBe('Jane Smith')
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)

      const foundUser = await repository.findByEmail('john@example.com')

      expect(foundUser).toBe(user)
      expect(foundUser?.getName()).toBe('John Doe')
    })

    it('should return null for non-existent email', async () => {
      const foundUser = await repository.findByEmail('nonexistent@example.com')

      expect(foundUser).toBeNull()
    })

    it('should be case sensitive', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)

      const foundUser = await repository.findByEmail('John@Example.com')

      expect(foundUser).toBeNull()
    })

    it('should return null for empty email', async () => {
      const foundUser = await repository.findByEmail('')

      expect(foundUser).toBeNull()
    })

    it('should handle multiple users and return correct one', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const foundUser = await repository.findByEmail('jane@example.com')

      expect(foundUser).toBe(user2)
      expect(foundUser?.getName()).toBe('Jane Smith')
    })
  })

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll()

      expect(users).toEqual([])
      expect(users).toHaveLength(0)
    })

    it('should return all users', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')
      const user3 = UserEntity.create('Bob Wilson', 'bob@example.com')

      await repository.save(user1)
      await repository.save(user2)
      await repository.save(user3)

      const users = await repository.findAll()

      expect(users).toHaveLength(3)
      expect(users).toContain(user1)
      expect(users).toContain(user2)
      expect(users).toContain(user3)
    })

    it('should return users in insertion order', async () => {
      const user1 = UserEntity.create('First User', 'first@example.com')
      const user2 = UserEntity.create('Second User', 'second@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const users = await repository.findAll()

      expect(users[0]).toBe(user1)
      expect(users[1]).toBe(user2)
    })

    it('should return new array each time (not reference)', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)

      const users1 = await repository.findAll()
      const users2 = await repository.findAll()

      expect(users1).not.toBe(users2)
      expect(users1).toEqual(users2)
    })
  })

  describe('delete', () => {
    it('should delete existing user', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)
      const userId = user.getId().getValue()

      await repository.delete(userId)

      const foundUser = await repository.findById(userId)
      expect(foundUser).toBeNull()
    })

    it('should remove user from all users list', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      await repository.delete(user1.getId().getValue())

      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(1)
      expect(allUsers[0]).toBe(user2)
    })

    it('should not throw error when deleting non-existent user', () => {
      expect(() => repository.delete('non-existent-id')).not.toThrow()
    })

    it('should not throw error when deleting from empty repository', () => {
      expect(() => repository.delete('any-id')).not.toThrow()
    })

    it('should make user unfindable by email after deletion', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await repository.save(user)
      const userEmail = user.getEmail().getValue()

      await repository.delete(user.getId().getValue())

      const foundByEmail = await repository.findByEmail(userEmail)
      expect(foundByEmail).toBeNull()
    })

    it('should handle deletion of multiple users', async () => {
      const user1 = UserEntity.create('User 1', 'user1@example.com')
      const user2 = UserEntity.create('User 2', 'user2@example.com')
      const user3 = UserEntity.create('User 3', 'user3@example.com')

      await repository.save(user1)
      await repository.save(user2)
      await repository.save(user3)

      await repository.delete(user1.getId().getValue())
      await repository.delete(user3.getId().getValue())

      const remainingUsers = await repository.findAll()
      expect(remainingUsers).toHaveLength(1)
      expect(remainingUsers[0]).toBe(user2)
    })
  })

  describe('data consistency', () => {
    it('should maintain data integrity across operations', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      const savedUser = await repository.save(user)
      const foundById = await repository.findById(user.getId().getValue())
      const foundByEmail = await repository.findByEmail('john@example.com')
      const allUsers = await repository.findAll()

      expect(savedUser).toBe(user)
      expect(foundById).toBe(user)
      expect(foundByEmail).toBe(user)
      expect(allUsers).toContain(user)
    })

    it('should handle concurrent operations', async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        UserEntity.create(`User ${i}`, `user${i}@example.com`)
      )

      const savePromises = users.map(user => repository.save(user))
      await Promise.all(savePromises)

      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(10)
    })
  })
})
