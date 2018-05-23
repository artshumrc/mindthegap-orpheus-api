## Authentication

### Auth on Server

JSON Web Tokens (JWT):

1. Login route: **/auth/login**.

  Pass `username` and `password` in the req body.

  If username and password are correct, server will respond with a `token`.


2. Register route: **/auth/register**.

  Pass `username` and `password` in the req body.

  If username and password are correct, server will respond with a `token`.

3. When using the `fetch` method in the client app, remember to set `authorization' header to the token value`. Otherwise the request will not be authenticated.

4. `apollo-client` has a middleware attached to the `networkInterface`, which reads the token value from the a cookie set with `react-cookie`.

### Auth on Client

#### Authentication methods (`client/src/lib/auth.js`):

**1. login**

  Runs fetch method to the login route and on success sets `token` value in a cookie.

**2. logout**

  Deletes `token` cookie.

**3. register**

  Runs fetch method to the register route and on success sets `token` value in a cookie.

#### Auth redux:

There is a `AuthModalContainer` component placed in the `Root` component, which handles all user authentication operations.

**Q: Where is user data stored in Redx Store?**

A: `userId` and `username` are stored in `store.auth`.
