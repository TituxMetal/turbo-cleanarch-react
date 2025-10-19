import { ConflictException } from '@nestjs/common'

import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { CreateUserUseCase } from './createUser.uc'

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    createUserUseCase = new CreateUserUseCase(userRepository)
  })

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john.doe@example.com' }

      const result = await createUserUseCase.execute(userData)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result.getName()).toBe(userData.name)
      expect(result.getEmail().getValue()).toBe(userData.email)
      expect(result.getId().getValue()).toBeDefined()
      expect(result.getCreatedAt()).toBeInstanceOf(Date)
      expect(result.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should throw ConflictException when user with email already exists', async () => {
      const userData = { name: 'John Doe', email: 'john.doe@example.com' }
      await createUserUseCase.execute(userData)

      await expect(createUserUseCase.execute(userData)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException for different user with same email', async () => {
      const firstUser = { name: 'John Doe', email: 'same@example.com' }
      const secondUser = { name: 'Jane Smith', email: 'same@example.com' }

      await createUserUseCase.execute(firstUser)

      await expect(createUserUseCase.execute(secondUser)).rejects.toThrow(ConflictException)
    })

    it('should call repository findByEmail with correct email', async () => {
      const userData = { name: 'Jane Smith', email: 'jane.smith@example.com' }
      const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail')

      await createUserUseCase.execute(userData)

      expect(findByEmailSpy).toHaveBeenCalledTimes(1)
      expect(findByEmailSpy).toHaveBeenCalledWith(userData.email)
    })

    it('should call repository save with correct user entity', async () => {
      const userData = { name: 'Bob Wilson', email: 'bob.wilson@example.com' }
      const saveSpy = jest.spyOn(userRepository, 'save')

      await createUserUseCase.execute(userData)

      expect(saveSpy).toHaveBeenCalledTimes(1)
      expect(saveSpy).toHaveBeenCalledWith(expect.any(UserEntity))

      const savedUser = saveSpy.mock.calls[0][0] as UserEntity
      expect(savedUser.getName()).toBe(userData.name)
      expect(savedUser.getEmail().getValue()).toBe(userData.email)
    })

    it('should return the saved user entity from repository', async () => {
      const userData = { name: 'Alice Brown', email: 'alice.brown@example.com' }

      const result = await createUserUseCase.execute(userData)
      const foundUser = await userRepository.findByEmail(userData.email)

      expect(result).toBe(foundUser)
    })

    it('should create users with different emails successfully', async () => {
      const user1 = { name: 'User One', email: 'user1@example.com' }
      const user2 = { name: 'User Two', email: 'user2@example.com' }

      const result1 = await createUserUseCase.execute(user1)
      const result2 = await createUserUseCase.execute(user2)

      expect(result1.getEmail().getValue()).toBe(user1.email)
      expect(result2.getEmail().getValue()).toBe(user2.email)
      expect(result1.getId().getValue()).not.toBe(result2.getId().getValue())
    })
  })

  describe('validation errors', () => {
    it('should throw error for invalid email format', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email' }

      await expect(createUserUseCase.execute(userData)).rejects.toThrow('Invalid email format')
    })

    it('should throw error for empty email', async () => {
      const userData = { name: 'John Doe', email: '' }

      await expect(createUserUseCase.execute(userData)).rejects.toThrow('Invalid email format')
    })

    it('should throw error for name shorter than 2 characters', async () => {
      const userData = { name: 'J', email: 'john@example.com' }

      await expect(createUserUseCase.execute(userData)).rejects.toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should throw error for empty name', async () => {
      const userData = { name: '', email: 'john@example.com' }

      await expect(createUserUseCase.execute(userData)).rejects.toThrow(
        'Name must be at least 2 characters long'
      )
    })

    it('should trim whitespace from name', async () => {
      const userData = { name: '  John Doe  ', email: 'john@example.com' }

      const result = await createUserUseCase.execute(userData)

      expect(result.getName()).toBe('John Doe')
    })
  })

  describe('error handling', () => {
    it('should propagate repository findByEmail errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        findByEmail: jest.fn().mockRejectedValue(new Error(errorMessage)),
        save: jest.fn()
      } as unknown as UserRepositoryPort

      const useCase = new CreateUserUseCase(mockRepository)

      await expect(
        useCase.execute({ name: 'John Doe', email: 'john@example.com' })
      ).rejects.toThrow(errorMessage)
    })

    it('should propagate repository save errors', async () => {
      const errorMessage = 'Save operation failed'
      const mockRepository = {
        findByEmail: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as UserRepositoryPort

      const useCase = new CreateUserUseCase(mockRepository)

      await expect(
        useCase.execute({ name: 'John Doe', email: 'john@example.com' })
      ).rejects.toThrow(errorMessage)
    })
  })
})
