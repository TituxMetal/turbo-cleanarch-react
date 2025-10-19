import { NotFoundException } from '@nestjs/common'

import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { UpdateUserUseCase } from './updateUser.uc'

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    updateUserUseCase = new UpdateUserUseCase(userRepository)
  })

  describe('execute', () => {
    it('should update user name successfully', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const updateData = { name: 'Jane Doe' }

      const result = await updateUserUseCase.execute(updateData, userId)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result.getName()).toBe('Jane Doe')
      expect(result.getEmail().getValue()).toBe('john@example.com')
      expect(result.getId().getValue()).toBe(userId)
    })

    it('should update user email successfully', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const updateData = { email: 'jane@example.com' }

      const result = await updateUserUseCase.execute(updateData, userId)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result.getName()).toBe('John Doe')
      expect(result.getEmail().getValue()).toBe('jane@example.com')
      expect(result.getId().getValue()).toBe(userId)
    })

    it('should update both name and email successfully', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const updateData = { name: 'Jane Smith', email: 'jane.smith@example.com' }

      const result = await updateUserUseCase.execute(updateData, userId)

      expect(result.getName()).toBe('Jane Smith')
      expect(result.getEmail().getValue()).toBe('jane.smith@example.com')
      expect(result.getId().getValue()).toBe(userId)
    })

    it('should not update anything when no fields provided', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const originalName = user.getName()
      const originalEmail = user.getEmail().getValue()
      const updateData = {}

      const result = await updateUserUseCase.execute(updateData, userId)

      expect(result.getName()).toBe(originalName)
      expect(result.getEmail().getValue()).toBe(originalEmail)
    })

    it('should update updatedAt timestamp', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const originalUpdatedAt = user.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))

      const result = await updateUserUseCase.execute({ name: 'Jane Doe' }, userId)

      expect(result.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should throw NotFoundException when user does not exist', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { name: 'Jane Doe' }

      await expect(updateUserUseCase.execute(updateData, nonExistentId)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should call repository findById with correct ID', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const findByIdSpy = jest.spyOn(userRepository, 'findById')

      await updateUserUseCase.execute({ name: 'Jane Doe' }, userId)

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(userId)
    })

    it('should call repository save with updated user', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const saveSpy = jest.spyOn(userRepository, 'save')
      saveSpy.mockClear()

      await updateUserUseCase.execute({ name: 'Jane Doe' }, userId)

      expect(saveSpy).toHaveBeenCalledTimes(1)
      expect(saveSpy).toHaveBeenCalledWith(expect.any(UserEntity))
    })

    it('should trim whitespace from name when updating', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      const result = await updateUserUseCase.execute({ name: '  Jane Doe  ' }, userId)

      expect(result.getName()).toBe('Jane Doe')
    })
  })

  describe('validation errors', () => {
    it('should throw error for invalid email format when updating', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      await expect(updateUserUseCase.execute({ email: 'invalid-email' }, userId)).rejects.toThrow(
        'Invalid email format'
      )
    })

    it('should throw error for empty email', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      await expect(updateUserUseCase.execute({ email: '' }, userId)).rejects.toThrow(
        'Invalid email format'
      )
    })

    it('should throw error for name shorter than 2 characters when updating', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      await expect(updateUserUseCase.execute({ name: 'J' }, userId)).rejects.toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should throw error for empty name', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      await expect(updateUserUseCase.execute({ name: '' }, userId)).rejects.toThrow(
        'Name must be at least 2 characters long'
      )
    })
  })

  describe('error handling', () => {
    it('should propagate repository findById errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage)),
        save: jest.fn()
      } as unknown as UserRepositoryPort

      const useCase = new UpdateUserUseCase(mockRepository)

      await expect(useCase.execute({ name: 'Jane Doe' }, 'any-id')).rejects.toThrow(errorMessage)
    })

    it('should propagate repository save errors', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      const errorMessage = 'Save operation failed'
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as UserRepositoryPort

      const useCase = new UpdateUserUseCase(mockRepository)

      await expect(useCase.execute({ name: 'Jane Doe' }, 'any-id')).rejects.toThrow(errorMessage)
    })
  })
})
