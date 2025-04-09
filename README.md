# IMF Gadget API

The **IMF Gadget API** is a secure API built for the Impossible Missions Force (IMF) to manage their gadgets. This API is developed with TypeScript, Node.js, Express, PostgreSQL, and Prisma. It features robust security measures including JWT-based authentication and authorization, as well as additional security enhancements like Helmet, CORS, and rate limiting. The API also includes comprehensive error handling.

## Features

- **Authentication & Authorization**:

  - **POST /auth/register**: Register a new user.
  - **POST /auth/login**: Login to receive a JWT token. This token is required to access protected routes (all `/gadgets` routes).

- **Gadget Inventory**:

  - **GET /gadgets**: Retrieve all gadgets with a randomly generated "mission success probability" for each.
  - **GET /gadgets?status={status}**: Filter gadgets by their status (e.g., Available, Deployed, Destroyed, Decommissioned).
  - **POST /gadgets**: Create a new gadget. A unique codename is generated automatically.
  - **PATCH /gadgets/:id**: Update gadget details.
  - **DELETE /gadgets/:id**: Soft-delete a gadget by marking it as "Decommissioned" and recording the decommission timestamp.
  - **POST /gadgets/:id/self-destruct**: Initiate a self-destruct sequence for a gadget (status updated to "Destroyed" and a confirmation code generated).

- **Security Enhancements**:

  - **Helmet** for setting secure HTTP headers.
  - **CORS** for handling Cross-Origin Resource Sharing.
  - **Rate Limiting** to prevent brute force and DDoS attacks.

- **Error Handling**:
  - Robust global error handling middleware to catch and respond to errors gracefully.

## Installation

1. **Clone the repository**:

   ```
   git clone https://github.com/your-username/imf-gadget-api.git
   cd imf-gadget-api
   ```

2. Install dependencies:

   ```
    npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/imf_gadget_api
   JWT_SECRET=your_jwt_secret
   ```

4. Initialize Prisma and Migrate Database:

   ```
    npx prisma migrate dev --name init
   ```

5. Start the dev server:
   ```
   npm run dev
   ```
