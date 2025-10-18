import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { DeleteUserUseCase } from './deleteUser.us'

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    deleteUserUseCase = new DeleteUserUseCase(userRepository)
  })

  describe('execute', () => {
    it('should delete an existing user successfully', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()

      await deleteUserUseCase.execute(userId)

      const deletedUser = await userRepository.findById(userId)
      expect(deletedUser).toBeNull()
    })

    it('should not throw error when deleting non-existent user', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(deleteUserUseCase.execute(nonExistentId)).resolves.not.toThrow()
    })

    it('should call repository delete with correct ID', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const deleteSpy = jest.spyOn(userRepository, 'delete')

      await deleteUserUseCase.execute(userId)

      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(deleteSpy).toHaveBeenCalledWith(userId)
    })

    it('should remove user from list of all users', async () => {
      const user1 = UserEntity.create('John Doe', 'john@example.com')
      const user2 = UserEntity.create('Jane Smith', 'jane@example.com')
      await userRepository.save(user1)
      await userRepository.save(user2)
      const userId1 = user1.getId().getValue()

      await deleteUserUseCase.execute(userId1)

      const allUsers = await userRepository.findAll()
      expect(allUsers).toHaveLength(1)
      expect(allUsers[0].getId().getValue()).toBe(user2.getId().getValue())
    })

    it('should handle deletion of multiple users', async () => {
      const user1 = UserEntity.create('User One', 'user1@example.com')
      const user2 = UserEntity.create('User Two', 'user2@example.com')
      const user3 = UserEntity.create('User Three', 'user3@example.com')

      await userRepository.save(user1)
      await userRepository.save(user2)
      await userRepository.save(user3)

      await deleteUserUseCase.execute(user1.getId().getValue())
      await deleteUserUseCase.execute(user3.getId().getValue())

      const remainingUsers = await userRepository.findAll()
      expect(remainingUsers).toHaveLength(1)
      expect(remainingUsers[0].getId().getValue()).toBe(user2.getId().getValue())
    })

    it('should handle deletion from empty repository', async () => {
      const allUsersBefore = await userRepository.findAll()
      expect(allUsersBefore).toHaveLength(0)

      await deleteUserUseCase.execute('any-id')

      const allUsersAfter = await userRepository.findAll()
      expect(allUsersAfter).toHaveLength(0)
    })

    it('should delete user and make it unfindable by email', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const userEmail = user.getEmail().getValue()

      await deleteUserUseCase.execute(userId)

      const foundByEmail = await userRepository.findByEmail(userEmail)
      expect(foundByEmail).toBeNull()
    })

    it('should allow creating user with same email after deletion', async () => {
      const user = UserEntity.create('John Doe', 'john@example.com')
      await userRepository.save(user)
      const userId = user.getId().getValue()
      const userEmail = user.getEmail().getValue()

      await deleteUserUseCase.execute(userId)

      const newUser = UserEntity.create('Jane Smith', userEmail)
      const savedNewUser = await userRepository.save(newUser)

      expect(savedNewUser.getName()).toBe('Jane Smith')
      expect(savedNewUser.getEmail().getValue()).toBe(userEmail)
      expect(savedNewUser.getId().getValue()).not.toBe(userId)
    })
  })

  describe('error handling', () => {
    it('should propagate repository delete errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        delete: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as UserRepositoryPort

      const useCase = new DeleteUserUseCase(mockRepository)

      await expect(useCase.execute('any-id')).rejects.toThrow(errorMessage)
    })

    it('should handle repository delete returning undefined', async () => {
      const mockRepository = {
        delete: jest.fn().mockResolvedValue(undefined)
      } as unknown as UserRepositoryPort

      const useCase = new DeleteUserUseCase(mockRepository)

      await expect(useCase.execute('any-id')).resolves.not.toThrow()
    })
  })
})
