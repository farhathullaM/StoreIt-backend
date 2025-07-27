📦 Secure File Storage System

A full-stack application for secure file uploads and management using Node.js, MongoDB, AWS S3, and React.

🛠️ Project Setup

📁 Backend (Node.js + Express)

Clone the repository -backend -node.js
  git clone https://github.com/farhathullaM/StoreIt-backend
Install Dependencies
  npm install
Create a .env file
  See .env.example for required variables or 
  PORT
  MONGO_URI
  JWT_SECRET
  JWT_REFRESH_SECRET

  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION
  AWS_BUCKET_NAME
Start the Server
  npm run dev

Clone the repository -fronted -React.js
  git clone https://github.com/farhathullaM/StoreIt
Install Dependencies
  npm install 
Change the base URL in index.html 
 window.__STOREIT_API_BASE_URL__ = "https://your-backend-url";
Start the App
  npm run dev


📄 API Documentation
Base URL 
  https://your-backend-url/api

🔐 Auth Routes (/api/auth)
  POST /register

  Registers a new user.
    Body:
      {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "password": "yourPassword"
      }

POST /login
  Logs in a user and returns access/refresh tokens.
  Body:
    {
    "email": "john@example.com",
    "password": "yourPassword"
    }

POST /refresh
  Refreshes the access token using the refresh token stored in cookies.

POST /logout
  Logs out the user and clears cookies.

📁 File Routes (/api/files)
  All file routes require authentication (bearer token).

  POST /upload
  Uploads a file to S3.
  Headers:
    Authorization: Bearer <access_token>
    Content-Type: multipart/form-data
  FormData:
    file: <your_file>

  GET /
    Returns a list of all uploaded files for the authenticated user.
    Headers:
    Authorization: Bearer <access_token>

  DELETE /:id
    Deletes a file by its ID.
    Headers:
      Authorization: Bearer <access_token>


🧑‍💻 Tech Stack

  Frontend: React, TypeScript, Tailwind CSS
  Backend: Node.js, Express.js
  Database: MongoDB
  Storage: AWS S3
  Auth: JWT (access + refresh tokens)

