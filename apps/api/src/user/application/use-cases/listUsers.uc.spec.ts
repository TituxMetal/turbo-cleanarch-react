import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { ListUsersUseCase } from './listUsers.uc'

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    listUsersUseCase = new ListUsersUseCase(userRepository)
  })

  describe('execute', () => {
    it('should return an empty array when no users exist', async () => {
      const result = await listUsersUseCase.execute()

      expect(result).toEqual([])
    })

    it('should return an array with one user when one user exists', async () => {
      const userData = { name: 'John Doe', email: 'john.doe@example.com' }
      const createdUser = UserEntity.create(userData.name, userData.email)
      await userRepository.save(createdUser)

      const result = await listUsersUseCase.execute()

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(UserEntity)
      expect(result[0].getName()).toBe(userData.name)
      expect(result[0].getEmail().getValue()).toBe(userData.email)
      expect(result[0]).toBe(createdUser)
    })

    it('should return all users when multiple users exist', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')
      const user3 = UserEntity.create('Bob Wilson', 'bob@example.com')

      await userRepository.save(user1)
      await userRepository.save(user2)
      await userRepository.save(user3)

      const result = await listUsersUseCase.execute()

      expect(result).toHaveLength(3)
      expect(result).toContain(user1)
      expect(result).toContain(user2)
      expect(result).toContain(user3)

      const emails = result.map(user => user.getEmail().getValue())
      expect(emails).toContain('john@example.com')
      expect(emails).toContain('jane@example.com')
      expect(emails).toContain('bob@example.com')
    })

    it('should return users in the order they were saved', async () => {
      const user1 = UserEntity.create('First User', 'first@example.com')
      const user2 = UserEntity.create('Second User', 'second@example.com')
      const user3 = UserEntity.create('Third User', 'third@example.com')

      await userRepository.save(user1)
      await userRepository.save(user2)
      await userRepository.save(user3)

      const result = await listUsersUseCase.execute()

      expect(result[0].getName()).toBe('First User')
      expect(result[1].getName()).toBe('Second User')
      expect(result[2].getName()).toBe('Third User')
    })

    it('should call repository findAll method', async () => {
      const findAllSpy = jest.spyOn(userRepository, 'findAll')

      await listUsersUseCase.execute()

      expect(findAllSpy).toHaveBeenCalledTimes(1)
      expect(findAllSpy).toHaveBeenCalledWith()
    })

    it('should return the exact same user entities from repository', async () => {
      const user1 = UserEntity.create('User One', 'user1@example.com')
      const user2 = UserEntity.create('User Two', 'user2@example.com')

      await userRepository.save(user1)
      await userRepository.save(user2)

      const result = await listUsersUseCase.execute()

      expect(result).toHaveLength(2)
      expect(result[0]).toBe(user1)
      expect(result[1]).toBe(user2)
    })

    it('should handle large number of users', async () => {
      const users = []
      for (let i = 1; i <= 100; i++) {
        const user = UserEntity.create(`User ${i}`, `user${i}@example.com`)
        users.push(user)
        await userRepository.save(user)
      }

      const result = await listUsersUseCase.execute()

      expect(result).toHaveLength(100)
      expect(result.every(user => user instanceof UserEntity)).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        findAll: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as UserRepositoryPort

      const useCase = new ListUsersUseCase(mockRepository)

      await expect(useCase.execute()).rejects.toThrow(errorMessage)
    })

    it('should handle repository returning null gracefully', async () => {
      const mockRepository = {
        findAll: jest.fn().mockResolvedValue(null)
      } as unknown as UserRepositoryPort

      const useCase = new ListUsersUseCase(mockRepository)

      const result = await useCase.execute()

      expect(result).toBeNull()
    })
  })
})
