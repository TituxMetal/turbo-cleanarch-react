import { Module } from '@nestjs/common'

import { TASK_REPOSITORY } from '~/task/application/ports/task.repository'
import { CreateTaskUseCase } from '~/task/application/use-cases/createTask.uc'
import { DeleteTaskUseCase } from '~/task/application/use-cases/deleteTask.uc'
import { GetTaskUseCase } from '~/task/application/use-cases/getTask.uc'
import { ListTasksUseCase } from '~/task/application/use-cases/listTasks.uc'
import { UpdateTaskUseCase } from '~/task/application/use-cases/updateTask.uc'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'
import { TaskController } from '~/task/presentation/task.controller'
import { UserModule } from '~/user/user.module'

@Module({
  imports: [UserModule],
  controllers: [TaskController],
  providers: [
    CreateTaskUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: InMemoryTaskRepository
    }
  ],
  exports: [TASK_REPOSITORY]
})
export class TaskModule {}
