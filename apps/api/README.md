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

## Response Format

All user endpoints return user objects with the following structure:

| Field        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `id`         | string | Unique identifier (UUID)          |
| `name`       | string | User's full name                  |
| `email`      | string | User's email address              |
| `createdAt`  | string | ISO 8601 timestamp of creation    |
| `updatedAt`  | string | ISO 8601 timestamp of last update |
| `accountAge` | number | Age of the account in days        |

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
├── user/
│   ├── application/
│   │   ├── ports/
│   │   │   └── user.repository.ts      # Repository interface
│   │   └── use-cases/
│   │       ├── createUser.uc.ts        # Create user use case
│   │       ├── getUser.uc.ts           # Get user by ID use case
│   │       ├── listUsers.us.ts         # List users use case
│   │       └── updateUser.uc.ts        # Update user use case
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entity.ts          # User domain entity
│   │   └── value-objects/
│   │       ├── email.vo.ts             # Email value object
│   │       └── id.vo.ts                # ID value object
│   ├── infrastructure/
│   │   └── adapters/
│   │       └── inMemoryUser.repository.ts  # In-memory implementation
│   └── presentation/
│       └── user.controller.ts          # HTTP controllers
└── app.module.ts                       # Main application module
```
