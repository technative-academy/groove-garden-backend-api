# React Project - example backend

This is an example backend API for the React project.

It allows users to register, log in, and manage their collections of things.

The API is built using Node.js, Express, and PostgreSQL.


## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (version 6 or higher)
- PostgreSQL (version 12 or higher)

### Install dependencies

```
npm install
```

### Environment Variables

Create a `.env` file in the root of the project - duplicate the `.env.example` file and replace values with your real values:

```
PORT=3001
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PW=your_db_password
DB_PORT=5432
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REACT_APP_DOMAIN=http://localhost:3000
NODE_ENV=development
```

### Database setup

See [docs/DB.md](docs/DB.md) for SQL for creating the database


## Running the Server

Start the server using the following command:

```
npm start
```

The server should now be running on [http://localhost:3001](http://localhost:3001)


## API endpoints

See [docs/API.md](docs/API.md) for API endpoints


## Tests

Tests are written with SuperTest, Mocha, Chai and Sinon.

To run them:

```
npm run test
```


## Auth

The application uses JSON Web Tokens (JWT) to authenticate users.

- Registering: Users create an account by providing their name, email, password, and a brief bio. The password is securely hashed before storage.

- Logging In: Users log in with their email and password. If the credentials are correct, the server issues an access token and a refresh token. The access token is short-lived, and the refresh token is used to obtain a new access token when the current one expires.

- Access Token: This token is included in the Authorization header of API requests to authenticate the user. It has a short expiry time (e.g., a few minutes).

- Refresh Token: This token is stored as an HTTP-only cookie and is used to get a new access token without requiring the user to log in again. It has a longer expiry time (e.g., 7 days).

- Refreshing Tokens: When the access token expires, the client can use the refresh token to request a new access token by calling the /refresh-token endpoint.

- Logging Out: Users log out by calling the /logout endpoint, which clears the refresh token cookie from the browser.

- Middleware: The authenticateToken middleware is used to protect routes that require authentication. It checks the validity of the access token and attaches the user's information to the request object.