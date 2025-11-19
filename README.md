# Backend api for Groove Garden playlist collections app

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
example env file:
# DB
DB_USER="user"
DB_PW="password"
DB_NAME="example_database"
DB_URL=postgres://user@localhost:5432/example_database
PORT=4000

#Other
NODE_ENV=development
ACCESS_TOKEN_SECRET="123"
REFRESH_TOKEN_SECRET="123"
APP_DOMAIN = http://localhost:3000
```

### Database setup

See [docs/DB.md](docs/DB.md) for SQL for creating the database

## Running the Server

Start the server using the following command:

```
npm start
```

The server should now be running on [http://localhost:4000](http://localhost:4000)

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
