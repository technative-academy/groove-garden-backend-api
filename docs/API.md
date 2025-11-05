# API Endpoints

## Auth

### `POST /api/auth/register`

Registers a new user.

- **Request:**
  - Body:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "password123",
      "bio": "Loves collecting things."
    }
    ```

- **Response:**
  - Status: `201 Created`
  - Body:
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "bio": "Loves collecting things."
    }
    ```

### `POST /api/auth/login`

Logs in a user and returns access and refresh tokens.

- **Request:**
  - Body:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "password123"
    }
    ```

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "accessToken": "access-token",
      "refreshToken": "refresh-token"
    }
    ```

### `POST /api/auth/refresh-token`

Refreshes the access token using the refresh token.

- **Request:**
  - Cookies:
    - `refreshToken`: "refresh-token"

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "accessToken": "new-access-token"
    }
    ```

### `POST /api/auth/logout`

Logs out a user and clears the refresh token cookie.

- **Request:** None

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "message": "Logged out"
    }
    ```

## Things

### `GET /api/things`

Gets all things. No authentication required.

- **Request:** None

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    [
      {
        "id": 1,
        "name": "Thing 1",
        "description": "Description of Thing 1",
        "user_id": 1,
        "user_name": "John Doe"
      },
      {
        "id": 2,
        "name": "Thing 2",
        "description": "Description of Thing 2",
        "user_id": 2,
        "user_name": "Jane Doe"
      }
    ]
    ```

### `GET /api/things/:id`

Gets a specific thing by ID. No authentication required.

- **Request:**
  - Params: `id`

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "id": 1,
      "name": "Thing 1",
      "description": "Description of Thing 1",
      "user_id": 1,
      "user_name": "John Doe"
    }
    ```

## Users

### `GET /api/users`

Gets all users. Requires authentication.

- **Request:** None

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    [
      {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
        "bio": "Loves collecting things."
      },
      {
        "id": 2,
        "name": "Jane Doe",
        "email": "janedoe@example.com",
        "bio": "Loves collecting other things."
      }
    ]
    ```

### `GET /api/users/:id`

Gets a specific user by ID. Requires authentication.

- **Request:**
  - Params: `id`

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "bio": "Loves collecting things."
    }
    ```

### `GET /api/users/:id/things`

Gets things for a specific user by ID. Requires authentication.

- **Request:**
  - Params: `id`

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    [
      {
        "id": 1,
        "name": "Thing 1",
        "description": "Description of Thing 1",
        "user_id": 1
      },
      {
        "id": 2,
        "name": "Thing 2",
        "description": "Description of Thing 2",
        "user_id": 1
      }
    ]
    ```

## My Things

### `GET /api/my-things`

Gets all things for the logged-in user. Requires authentication.

- **Request:** None

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    [
      {
        "id": 1,
        "name": "My Thing 1",
        "description": "Description of My Thing 1",
        "user_id": 1
      },
      {
        "id": 2,
        "name": "My Thing 2",
        "description": "Description of My Thing 2",
        "user_id": 1
      }
    ]
    ```

### `POST /api/my-things`

Adds a new thing for the logged-in user. Requires authentication.

- **Request:**
  - Body:
    ```json
    {
      "name": "New Thing",
      "description": "Description of New Thing"
    }
    ```

- **Response:**
  - Status: `201 Created`
  - Body:
    ```json
    {
      "id": 3,
      "name": "New Thing",
      "description": "Description of New Thing",
      "user_id": 1
    }
    ```

### `PUT /api/my-things/:id`

Updates a specific thing for the logged-in user. Requires authentication.

- **Request:**
  - Params: `id`
  - Body:
    ```json
    {
      "name": "Updated Thing",
      "description": "Updated Description"
    }
    ```

- **Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "id": 1,
      "name": "Updated Thing",
      "description": "Updated Description",
      "user_id": 1
    }
    ```

### `DELETE /api/my-things/:id`

Deletes a specific thing for the logged-in user. Requires authentication.

- **Request:**
  - Params: `id`

- **Response:**
  - Status: `204 No Content`
