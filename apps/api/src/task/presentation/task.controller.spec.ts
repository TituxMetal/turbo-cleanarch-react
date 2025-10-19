import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CreateTaskUseCase } from '~/task/application/use-cases/createTask.uc'
import { GetTaskUseCase } from '~/task/application/use-cases/getTask.uc'
import { ListTasksUseCase } from '~/task/application/use-cases/listTasks.uc'
import { UpdateTaskUseCase } from '~/task/application/use-cases/updateTask.uc'
import { DeleteTaskUseCase } from '~/task/application/use-cases/deleteTask.uc'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'

import { TaskController } from './task.controller'

describe('TaskController', () => {
  let controller: TaskController
  let createTaskUseCase: jest.Mocked<CreateTaskUseCase>
  let getTaskUseCase: jest.Mocked<GetTaskUseCase>
  let listTasksUseCase: jest.Mocked<ListTasksUseCase>
  let updateTaskUseCase: jest.Mocked<UpdateTaskUseCase>
  let deleteTaskUseCase: jest.Mocked<DeleteTaskUseCase>

  beforeEach(async () => {
    const mockCreateTaskUseCase = {
      execute: jest.fn()
    }
    const mockGetTaskUseCase = {
      execute: jest.fn()
    }
    const mockListTasksUseCase = {
      execute: jest.fn()
    }
    const mockUpdateTaskUseCase = {
      execute: jest.fn()
    }
    const mockDeleteTaskUseCase = {
      execute: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: mockCreateTaskUseCase
        },
        {
          provide: GetTaskUseCase,
          useValue: mockGetTaskUseCase
        },
        {
          provide: ListTasksUseCase,
          useValue: mockListTasksUseCase
        },
        {
          provide: UpdateTaskUseCase,
          useValue: mockUpdateTaskUseCase
        },
        {
          provide: DeleteTaskUseCase,
          useValue: mockDeleteTaskUseCase
        }
      ]
    }).compile()

    controller = module.get<TaskController>(TaskController)
    createTaskUseCase = module.get(CreateTaskUseCase)
    getTaskUseCase = module.get(GetTaskUseCase)
    listTasksUseCase = module.get(ListTasksUseCase)
    updateTaskUseCase = module.get(UpdateTaskUseCase)
    deleteTaskUseCase = module.get(DeleteTaskUseCase)
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-123'
      }
      const mockTask = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      createTaskUseCase.execute.mockResolvedValue(mockTask)

      const result = await controller.createTask(createTaskDto)

      expect(createTaskUseCase.execute).toHaveBeenCalledWith(createTaskDto)
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatusEnum.TODO,
          userId: 'user-123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          completedAt: null
        })
      )
    })

    it('should propagate NotFoundException when user not found', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-123'
      }
      createTaskUseCase.execute.mockRejectedValue(new NotFoundException('User not found'))

      await expect(controller.createTask(createTaskDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getTask', () => {
    it('should return a task by id', async () => {
      const taskId = 'task-123'
      const mockTask = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      getTaskUseCase.execute.mockResolvedValue(mockTask)

      const result = await controller.getTask(taskId)

      expect(getTaskUseCase.execute).toHaveBeenCalledWith(taskId)
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Test Task',
          description: 'Test Description'
        })
      )
    })

    it('should propagate NotFoundException when task not found', async () => {
      const taskId = 'non-existent-task'
      getTaskUseCase.execute.mockRejectedValue(new NotFoundException('Task not found'))

      await expect(controller.getTask(taskId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('listTasks', () => {
    it('should return all tasks when no userId provided', async () => {
      const mockTasks = [
        TaskEntity.create('Task 1', 'Description 1', 'user-1'),
        TaskEntity.create('Task 2', 'Description 2', 'user-2')
      ]
      listTasksUseCase.execute.mockResolvedValue(mockTasks)

      const result = await controller.listTasks()

      expect(listTasksUseCase.execute).toHaveBeenCalledWith(undefined)
      expect(result).toHaveLength(2)
    })

    it('should return tasks filtered by userId', async () => {
      const userId = 'user-123'
      const mockTasks = [
        TaskEntity.create('Task 1', 'Description 1', userId),
        TaskEntity.create('Task 2', 'Description 2', userId)
      ]
      listTasksUseCase.execute.mockResolvedValue(mockTasks)

      const result = await controller.listTasks(userId)

      expect(listTasksUseCase.execute).toHaveBeenCalledWith(userId)
      expect(result).toHaveLength(2)
      expect(result[0].userId).toBe(userId)
    })
  })

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const taskId = 'task-123'
      const updateDto = { title: 'Updated Title' }
      const mockTask = TaskEntity.create('Original Title', 'Description', 'user-123')
      mockTask.updateTitle('Updated Title')
      updateTaskUseCase.execute.mockResolvedValue(mockTask)

      const result = await controller.updateTask(taskId, updateDto)

      expect(updateTaskUseCase.execute).toHaveBeenCalledWith(taskId, updateDto)
      expect(result.title).toBe('Updated Title')
    })

    it('should propagate NotFoundException when task not found', async () => {
      const taskId = 'non-existent-task'
      const updateDto = { title: 'Updated Title' }
      updateTaskUseCase.execute.mockRejectedValue(new NotFoundException('Task not found'))

      await expect(controller.updateTask(taskId, updateDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      const taskId = 'task-123'
      const mockTask = TaskEntity.create('Test Task', 'Description', 'user-123')
      mockTask.markAsCompleted()
      updateTaskUseCase.execute.mockResolvedValue(mockTask)

      const result = await controller.completeTask(taskId)

      expect(updateTaskUseCase.execute).toHaveBeenCalledWith(taskId, { status: 'COMPLETED' })
      expect(result.status).toBe(TaskStatusEnum.COMPLETED)
      expect(result.completedAt).toBeInstanceOf(Date)
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskId = 'task-123'
      deleteTaskUseCase.execute.mockResolvedValue(undefined)

      const result = await controller.deleteTask(taskId)

      expect(deleteTaskUseCase.execute).toHaveBeenCalledWith(taskId)
      expect(result).toEqual({ message: 'Task deleted successfully' })
    })

    it('should propagate NotFoundException when task not found', async () => {
      const taskId = 'non-existent-task'
      deleteTaskUseCase.execute.mockRejectedValue(new NotFoundException('Task not found'))

      await expect(controller.deleteTask(taskId)).rejects.toThrow(NotFoundException)
    })
  })
})
