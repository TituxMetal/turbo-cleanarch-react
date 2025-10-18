import { NotFoundException } from '@nestjs/common'

import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { GetUserUseCase } from './getUser.uc'

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    getUserUseCase = new GetUserUseCase(userRepository)
  })

  describe('execute', () => {
    it('should return a user when found by valid ID', async () => {
      const userData = { name: 'John Doe', email: 'john.doe@example.com' }
      const createdUser = UserEntity.create(userData.name, userData.email)
      await userRepository.save(createdUser)
      const userId = createdUser.getId().getValue()

      const result = await getUserUseCase.execute(userId)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result.getId().getValue()).toBe(userId)
      expect(result.getName()).toBe(userData.name)
      expect(result.getEmail().getValue()).toBe(userData.email)
      expect(result.getCreatedAt()).toBeInstanceOf(Date)
      expect(result.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should throw NotFoundException when user is not found', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(getUserUseCase.execute(nonExistentId)).rejects.toThrow(NotFoundException)
      await expect(getUserUseCase.execute(nonExistentId)).rejects.toThrow('User not found')
    })

    it('should throw NotFoundException when user ID is empty string', async () => {
      const emptyId = ''

      await expect(getUserUseCase.execute(emptyId)).rejects.toThrow(NotFoundException)
    })

    it('should call repository findById with correct ID', async () => {
      const userData = { name: 'Jane Smith', email: 'jane.smith@example.com' }
      const createdUser = UserEntity.create(userData.name, userData.email)
      await userRepository.save(createdUser)
      const userId = createdUser.getId().getValue()

      const findByIdSpy = jest.spyOn(userRepository, 'findById')

      await getUserUseCase.execute(userId)

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(userId)
    })

    it('should return the exact same user entity from repository', async () => {
      const userData = { name: 'Bob Wilson', email: 'bob.wilson@example.com' }
      const createdUser = UserEntity.create(userData.name, userData.email)
      await userRepository.save(createdUser)
      const userId = createdUser.getId().getValue()

      const result = await getUserUseCase.execute(userId)

      expect(result).toBe(createdUser)
    })

    it('should handle multiple users and return the correct one', async () => {
      const user1 = UserEntity.create('User One', 'user1@example.com')
      const user2 = UserEntity.create('User Two', 'user2@example.com')
      const user3 = UserEntity.create('User Three', 'user3@example.com')

      await userRepository.save(user1)
      await userRepository.save(user2)
      await userRepository.save(user3)

      const result = await getUserUseCase.execute(user2.getId().getValue())

      expect(result.getId().getValue()).toBe(user2.getId().getValue())
      expect(result.getName()).toBe('User Two')
      expect(result.getEmail().getValue()).toBe('user2@example.com')
    })
  })

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as UserRepositoryPort

      const useCase = new GetUserUseCase(mockRepository)

      await expect(useCase.execute('any-id')).rejects.toThrow(errorMessage)
    })
  })
})
