# My-Portfolio-Server

## Installation:
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create `.env` file to root and assign appropriate value.

    ```bash
    MONGODB_URI=
    PORT=
    ```
4. Run the server using `npm run dev`.

## Configuration:
- Environment Variables:
  - `PORT`: Port number the server listens on. Default: 5000
  - `MONGODB_URI`: URI for MongoDB database.

## Usage:
- API Endpoints:
  - POST `/projects`
  - GET `/projects`
  - POST `/skills`
  - GET `/skills`
  - POST `/blogs`
  - GET `/blogs`
  - GET `/blogs/id`

## Dependencies:
- `cors`: Express middleware for enabling CORS.
- `dotenv`: Loads environment variables from .env file.
- `express`: Web framework for Node.js.
- `mongodb`: MongoDB driver for Node.js.
- `nodemon`: Utility for automatically restarting the server during development.

## Server Link
Hosted in Vercel -> [my-portfolio-server](https://my-portfolio-server-bay.vercel.app)