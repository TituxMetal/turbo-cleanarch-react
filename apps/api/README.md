# NestJs Api

This directory contains the backend API built with NestJS following Clean Architecture principles
with Hexagonal Architecture pattern.

## Architecture

The API is structured using:

- **Clean Architecture**: Separation of concerns with clear boundaries between layers
- **Hexagonal Architecture**: Ports and adapters pattern for external dependencies
- **Domain-Driven Design**: Rich domain entities and value objects

## Getting Started

### Installation

```bash
pnpm install
```

### Running the Application

```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### User Management

#### Create User

Creates a new user in the system.

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "id": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-10-17T04:12:15.952Z",
  "updatedAt": "2025-10-17T04:12:15.952Z",
  "accountAge": 0
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }' | jq
```

#### Get All Users

Retrieves a list of all users.

**Endpoint:** `GET /users`

**Response:**

```json
[
  {
    "id": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-10-17T04:12:15.952Z",
    "updatedAt": "2025-10-17T04:12:15.952Z",
    "accountAge": 1
  }
]
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/users | jq
```

#### Get User by ID

Retrieves a specific user by their ID.

**Endpoint:** `GET /users/:id`

**Parameters:**

- `id` (string): The unique identifier of the user

**Response:**

```json
{
  "id": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-10-17T04:12:15.952Z",
  "updatedAt": "2025-10-17T04:12:15.952Z",
  "accountAge": 1
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/users/a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2 | jq
```

#### Update User

Updates an existing user's information.

**Endpoint:** `PUT /users/:id`

**Parameters:**

- `id` (string): The unique identifier of the user

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

_Note: Both `name` and `email` are optional. You can update either field independently._

**Response:**

```json
{
  "id": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "createdAt": "2025-10-17T04:12:15.952Z",
  "updatedAt": "2025-10-17T04:13:22.145Z",
  "accountAge": 1
}
```

**cURL Examples:**

Update both name and email:

```bash
curl -X PUT http://localhost:3000/users/a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }' | jq
```

Update only name:

```bash
curl -X PUT http://localhost:3000/users/a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}' | jq
```

Update only email:

```bash
curl -X PUT http://localhost:3000/users/a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2 \
  -H "Content-Type: application/json" \
  -d '{"email": "jane.smith@example.com"}' | jq
```

### Task Management

#### Create Task

Creates a new task for a user.

**Endpoint:** `POST /tasks`

**Request Body:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2"
}
```

**Response:**

```json
{
  "id": "b7ef6c12-4a2d-4e8f-9c5d-1234567890ab",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "TODO",
  "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "createdAt": "2025-10-19T08:30:00.000Z",
  "updatedAt": "2025-10-19T08:30:00.000Z",
  "completedAt": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2"
  }' | jq
```

#### Get All Tasks

Retrieves a list of all tasks, optionally filtered by user.

**Endpoint:** `GET /tasks`

**Query Parameters:**

- `userId` (optional, string): Filter tasks by user ID

**Response:**

```json
[
  {
    "id": "b7ef6c12-4a2d-4e8f-9c5d-1234567890ab",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "TODO",
    "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
    "createdAt": "2025-10-19T08:30:00.000Z",
    "updatedAt": "2025-10-19T08:30:00.000Z",
    "completedAt": null
  }
]
```

**cURL Examples:**

Get all tasks:

```bash
curl -X GET http://localhost:3000/tasks | jq
```

Get tasks for specific user:

```bash
curl -X GET "http://localhost:3000/tasks?userId=a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2" | jq
```

#### Get Task by ID

Retrieves a specific task by its ID.

**Endpoint:** `GET /tasks/:id`

**Parameters:**

- `id` (string): The unique identifier of the task

**Response:**

```json
{
  "id": "b7ef6c12-4a2d-4e8f-9c5d-1234567890ab",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "TODO",
  "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "createdAt": "2025-10-19T08:30:00.000Z",
  "updatedAt": "2025-10-19T08:30:00.000Z",
  "completedAt": null
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/tasks/b7ef6c12-4a2d-4e8f-9c5d-1234567890ab | jq
```

#### Update Task

Updates an existing task's information.

**Endpoint:** `PUT /tasks/:id`

**Parameters:**

- `id` (string): The unique identifier of the task

**Request Body:**

```json
{
  "title": "Complete API documentation",
  "description": "Write comprehensive API documentation with examples",
  "status": "IN_PROGRESS"
}
```

_Note: All fields are optional. You can update any combination of fields._

**Valid Status Values:**

- `TODO`: Task not started
- `IN_PROGRESS`: Task is being worked on
- `COMPLETED`: Task is finished

**Response:**

```json
{
  "id": "b7ef6c12-4a2d-4e8f-9c5d-1234567890ab",
  "title": "Complete API documentation",
  "description": "Write comprehensive API documentation with examples",
  "status": "IN_PROGRESS",
  "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "createdAt": "2025-10-19T08:30:00.000Z",
  "updatedAt": "2025-10-19T08:35:00.000Z",
  "completedAt": null
}
```

**cURL Examples:**

Update multiple fields:

```bash
curl -X PUT http://localhost:3000/tasks/b7ef6c12-4a2d-4e8f-9c5d-1234567890ab \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "status": "IN_PROGRESS"
  }' | jq
```

Update only status:

```bash
curl -X PUT http://localhost:3000/tasks/b7ef6c12-4a2d-4e8f-9c5d-1234567890ab \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}' | jq
```

#### Mark Task as Complete

Convenience endpoint to mark a task as completed.

**Endpoint:** `PATCH /tasks/:id/complete`

**Parameters:**

- `id` (string): The unique identifier of the task

**Response:**

```json
{
  "id": "b7ef6c12-4a2d-4e8f-9c5d-1234567890ab",
  "title": "Complete API documentation",
  "description": "Write comprehensive API documentation with examples",
  "status": "COMPLETED",
  "userId": "a3dc5fa0-9d38-43ef-87bb-9adc8572cfa2",
  "createdAt": "2025-10-19T08:30:00.000Z",
  "updatedAt": "2025-10-19T08:40:00.000Z",
  "completedAt": "2025-10-19T08:40:00.000Z"
}
```

**cURL Example:**

```bash
curl -X PATCH http://localhost:3000/tasks/b7ef6c12-4a2d-4e8f-9c5d-1234567890ab/complete | jq
```

#### Delete Task

Deletes a task from the system.

**Endpoint:** `DELETE /tasks/:id`

**Parameters:**

- `id` (string): The unique identifier of the task

**Response:**

```json
{
  "message": "Task deleted successfully"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/tasks/b7ef6c12-4a2d-4e8f-9c5d-1234567890ab | jq
```

## Response Format

### User Object

All user endpoints return user objects with the following structure:

| Field        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `id`         | string | Unique identifier (UUID)          |
| `name`       | string | User's full name                  |
| `email`      | string | User's email address              |
| `createdAt`  | string | ISO 8601 timestamp of creation    |
| `updatedAt`  | string | ISO 8601 timestamp of last update |
| `accountAge` | number | Age of the account in days        |

### Task Object

All task endpoints return task objects with the following structure:

| Field         | Type         | Description                                   |
| ------------- | ------------ | --------------------------------------------- |
| `id`          | string       | Unique identifier (UUID)                      |
| `title`       | string       | Task title (1-200 characters)                 |
| `description` | string       | Task description (max 2000 characters)        |
| `status`      | string       | Current status (TODO, IN_PROGRESS, COMPLETED) |
| `userId`      | string       | ID of the user who owns this task             |
| `createdAt`   | string       | ISO 8601 timestamp of creation                |
| `updatedAt`   | string       | ISO 8601 timestamp of last update             |
| `completedAt` | string\|null | ISO 8601 timestamp when marked complete       |

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid request data
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Data Validation

### User Creation/Update

- `name`: Required for creation, optional for updates (string)
- `email`: Required for creation, optional for updates (valid email format)
- Email addresses must be unique across the system

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Architecture**: Clean Architecture with Hexagonal pattern
- **Storage**: In-memory repository (for development)

## Project Structure

```text
src/
├── common/
│   └── filters/
│       └── httpException.filter.ts    # Global HTTP exception filter
├── user/
│   ├── application/
│   │   ├── ports/
│   │   │   └── user.repository.ts      # Repository interface
│   │   └── use-cases/
│   │       ├── createUser.uc.ts        # Create user use case
│   │       ├── getUser.uc.ts           # Get user by ID use case
│   │       ├── listUsers.uc.ts         # List users use case
│   │       ├── updateUser.uc.ts        # Update user use case
│   │       └── deleteUser.uc.ts        # Delete user use case
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entity.ts          # User domain entity
│   │   └── value-objects/
│   │       ├── email.vo.ts             # Email value object
│   │       └── id.vo.ts                # ID value object
│   ├── infrastructure/
│   │   └── adapters/
│   │       └── inMemoryUser.repository.ts  # In-memory implementation
│   ├── presentation/
│   │   └── user.controller.ts          # HTTP controllers
│   └── user.module.ts                  # User module
├── task/
│   ├── application/
│   │   ├── ports/
│   │   │   └── task.repository.ts      # Repository interface
│   │   └── use-cases/
│   │       ├── createTask.uc.ts        # Create task use case
│   │       ├── getTask.uc.ts           # Get task by ID use case
│   │       ├── listTasks.uc.ts         # List tasks use case
│   │       ├── updateTask.uc.ts        # Update task use case
│   │       └── deleteTask.uc.ts        # Delete task use case
│   ├── domain/
│   │   ├── entities/
│   │   │   └── task.entity.ts          # Task domain entity
│   │   └── value-objects/
│   │       ├── taskId.vo.ts            # Task ID value object
│   │       └── taskStatus.vo.ts        # Task status value object
│   ├── infrastructure/
│   │   └── adapters/
│   │       └── inMemoryTask.repository.ts  # In-memory implementation
│   ├── presentation/
│   │   └── task.controller.ts          # HTTP controllers
│   └── task.module.ts                  # Task module
├── main.ts                             # Application entry point
└── app.module.ts                       # Main application module
```
