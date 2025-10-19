import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common'

import { CreateTaskUseCase } from '~/task/application/use-cases/createTask.uc'
import { DeleteTaskUseCase } from '~/task/application/use-cases/deleteTask.uc'
import { GetTaskUseCase } from '~/task/application/use-cases/getTask.uc'
import { ListTasksUseCase } from '~/task/application/use-cases/listTasks.uc'
import { UpdateTaskDto, UpdateTaskUseCase } from '~/task/application/use-cases/updateTask.uc'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase
  ) {}

  @Post()
  async createTask(@Body() request: { title: string; description: string; userId: string }) {
    const task = await this.createTaskUseCase.execute(request)
    return this.mapToResponse(task)
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    const task = await this.getTaskUseCase.execute(id)
    return this.mapToResponse(task)
  }

  @Get()
  async listTasks(@Query('userId') userId?: string) {
    const tasks = await this.listTasksUseCase.execute(userId)
    return tasks.map(task => this.mapToResponse(task))
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() request: { title?: string; description?: string; status?: TaskStatusEnum }
  ) {
    const updateDto: UpdateTaskDto = {
      title: request.title,
      description: request.description,
      status: request.status
    }
    const task = await this.updateTaskUseCase.execute(id, updateDto)
    return this.mapToResponse(task)
  }

  @Patch(':id/complete')
  async completeTask(@Param('id') id: string) {
    const task = await this.updateTaskUseCase.execute(id, { status: TaskStatusEnum.COMPLETED })
    return this.mapToResponse(task)
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    await this.deleteTaskUseCase.execute(id)
    return { message: 'Task deleted successfully' }
  }

  private mapToResponse(task: TaskEntity) {
    return {
      id: task.getId().getValue(),
      title: task.getTitle(),
      description: task.getDescription(),
      status: task.getStatus().getValue(),
      userId: task.getUserId().getValue(),
      createdAt: task.getCreatedAt(),
      updatedAt: task.getUpdatedAt(),
      completedAt: task.getCompletedAt()
    }
  }
}
