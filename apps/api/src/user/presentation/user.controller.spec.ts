import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CreateUserUseCase } from '~/user/application/use-cases/createUser.uc'
import { GetUserUseCase } from '~/user/application/use-cases/getUser.uc'
import { ListUsersUseCase } from '~/user/application/use-cases/listUsers.uc'
import { UpdateUserUseCase } from '~/user/application/use-cases/updateUser.uc'
import { UserEntity } from '~/user/domain/entities/user.entity'

import { UserController } from './user.controller'

describe('UserController', () => {
  let controller: UserController
  let createUserUseCase: jest.Mocked<CreateUserUseCase>
  let getUserUseCase: jest.Mocked<GetUserUseCase>
  let listUsersUseCase: jest.Mocked<ListUsersUseCase>
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>

  beforeEach(async () => {
    const mockCreateUserUseCase = {
      execute: jest.fn()
    }
    const mockGetUserUseCase = {
      execute: jest.fn()
    }
    const mockListUsersUseCase = {
      execute: jest.fn()
    }
    const mockUpdateUserUseCase = {
      execute: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: mockCreateUserUseCase
        },
        {
          provide: GetUserUseCase,
          useValue: mockGetUserUseCase
        },
        {
          provide: ListUsersUseCase,
          useValue: mockListUsersUseCase
        },
        {
          provide: UpdateUserUseCase,
          useValue: mockUpdateUserUseCase
        }
      ]
    }).compile()

    controller = module.get<UserController>(UserController)
    createUserUseCase = module.get(CreateUserUseCase)
    getUserUseCase = module.get(GetUserUseCase)
    listUsersUseCase = module.get(ListUsersUseCase)
    updateUserUseCase = module.get(UpdateUserUseCase)
  })

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' }
      const mockUser = UserEntity.create('John Doe', 'john@example.com')
      createUserUseCase.execute.mockResolvedValue(mockUser)

      const result = await controller.createUser(createUserDto)

      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          accountAge: expect.any(Number)
        })
      )
    })

    it('should throw error when user creation fails', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' }
      createUserUseCase.execute.mockResolvedValue(null)

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        'Unexpected null user returned from create operation'
      )
    })

    it('should propagate ConflictException', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' }
      createUserUseCase.execute.mockRejectedValue(new ConflictException())

      await expect(controller.createUser(createUserDto)).rejects.toThrow(ConflictException)
    })

    it('should propagate domain validation errors', async () => {
      const createUserDto = { name: 'J', email: 'john@example.com' }
      createUserUseCase.execute.mockRejectedValue(
        new Error('Name must be at least 2 characters long')
      )

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        'Name must be at least 2 characters long'
      )
    })
  })

  describe('getUser', () => {
    it('should get user by ID successfully', async () => {
      const userId = 'user-id-123'
      const mockUser = UserEntity.create('John Doe', 'john@example.com')
      getUserUseCase.execute.mockResolvedValue(mockUser)

      const result = await controller.getUser(userId)

      expect(getUserUseCase.execute).toHaveBeenCalledWith(userId)
      expect(result).toEqual({
        id: mockUser.getId().getValue(),
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: mockUser.getCreatedAt(),
        updatedAt: mockUser.getUpdatedAt(),
        accountAge: mockUser.getAccountAge()
      })
    })

    it('should propagate NotFoundException', async () => {
      const userId = 'non-existent-id'
      getUserUseCase.execute.mockRejectedValue(new NotFoundException('User not found'))

      await expect(controller.getUser(userId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('listUsers', () => {
    it('should list all users successfully', async () => {
      const mockUser1 = UserEntity.create('John Doe', 'john@example.com')
      const mockUser2 = UserEntity.create('Jane Smith', 'jane@example.com')
      const mockUsers = [mockUser1, mockUser2]
      listUsersUseCase.execute.mockResolvedValue(mockUsers)

      const result = await controller.listUsers()

      expect(listUsersUseCase.execute).toHaveBeenCalledWith()
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          accountAge: expect.any(Number)
        })
      )
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          accountAge: expect.any(Number)
        })
      )
    })

    it('should return empty array when no users exist', async () => {
      listUsersUseCase.execute.mockResolvedValue([])

      const result = await controller.listUsers()

      expect(result).toEqual([])
    })

    it('should propagate repository errors', async () => {
      listUsersUseCase.execute.mockRejectedValue(new Error('Repository operation failed'))

      await expect(controller.listUsers()).rejects.toThrow('Repository operation failed')
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-id-123'
      const updateUserDto = { name: 'Jane Doe', email: 'jane@example.com' }
      const mockUser = UserEntity.create('Jane Doe', 'jane@example.com')
      updateUserUseCase.execute.mockResolvedValue(mockUser)

      const result = await controller.updateUser(userId, updateUserDto)

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(updateUserDto, userId)
      expect(result).toEqual({
        id: mockUser.getId().getValue(),
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: mockUser.getCreatedAt(),
        updatedAt: mockUser.getUpdatedAt(),
        accountAge: mockUser.getAccountAge()
      })
    })

    it('should update only name', async () => {
      const userId = 'user-id-123'
      const updateUserDto = { name: 'Jane Doe' }
      const mockUser = UserEntity.create('Jane Doe', 'original@example.com')
      updateUserUseCase.execute.mockResolvedValue(mockUser)

      const result = await controller.updateUser(userId, updateUserDto)

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(updateUserDto, userId)
      expect(result.name).toBe('Jane Doe')
    })

    it('should update only email', async () => {
      const userId = 'user-id-123'
      const updateUserDto = { email: 'newemail@example.com' }
      const mockUser = UserEntity.create('Original Name', 'newemail@example.com')
      updateUserUseCase.execute.mockResolvedValue(mockUser)

      const result = await controller.updateUser(userId, updateUserDto)

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(updateUserDto, userId)
      expect(result.email).toBe('newemail@example.com')
    })

    it('should propagate NotFoundException', async () => {
      const userId = 'non-existent-id'
      const updateUserDto = { name: 'Jane Doe' }
      updateUserUseCase.execute.mockRejectedValue(new NotFoundException('User not found'))

      await expect(controller.updateUser(userId, updateUserDto)).rejects.toThrow(NotFoundException)
    })

    it('should propagate domain validation errors', async () => {
      const userId = 'user-id-123'
      const updateUserDto = { email: 'invalid-email' }
      updateUserUseCase.execute.mockRejectedValue(new Error('Invalid email format'))

      await expect(controller.updateUser(userId, updateUserDto)).rejects.toThrow(
        'Invalid email format'
      )
    })
  })
})
