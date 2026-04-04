Thumblify Backend

Thumblify is a backend service for generating thumbnails using AI. It provides REST APIs for authentication, thumbnail generation, and user management. Built with Node.js/Express and JWT authentication.

🚀 Features
User Authentication: Signup, Login, Logout, Verify
Thumbnail Generation: Create thumbnails from images or text
JWT-based authentication & session management
Error handling with proper status codes
Easy-to-integrate REST APIs for frontend

🛠 Tech Stack
Backend: Node.js, Express (or your framework)
Database: (e.g., MongoDB / MySQL)
Authentication: JWT (JSON Web Tokens)
Middleware: CORS, Body-parser
Other Tools: Axios (for API calls), dotenv (environment variables)

🔹 API Endpoints
Method Endpoint Description Auth Required
POST /auth/register Signup a new user No
POST /auth/login Login user and return JWT No
POST /auth/logout Logout user Yes
GET /auth/verify Verify token & fetch user Yes
POST /thumbnail/generate Generate a thumbnail Yes

⚡ Setup Instructions
Clone the repo
git clone https://github.com/nikhilkeshavmali/thumblify-Backend.git
cd thumblify-backend
Install dependencies
npm install
Setup environment variables

Create a .env file:

PORT=3000
DB_URI=your_database_connection_string
JWT_SECRET=your_jwt_secret
Run the server
npm run dev # for development with nodemon
npm start # for production

Server should run on http://localhost:3000.

📝 Error Handling
401 Unauthorized – If JWT token is missing or invalid
400 Bad Request – Invalid request body or missing fields
500 Internal Server Error – Server or database issues

💡 Usage Example

Login request:

POST /auth/login
Content-Type: application/json

{
"email": "user@example.com",
"password": "password123"
}

Generate thumbnail request:

POST /thumbnail/generate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
"imageUrl": "https://example.com/image.jpg",
"title": "My Thumbnail"
}

🛡 Security
All protected routes require JWT authentication
Passwords should be hashed before storing in the database

🤝 Contributing
Fork the repo
Create a new branch (git checkout -b feature-name)
Commit your changes (git commit -m 'Add feature')
Push to the branch (git push origin feature-name)
Open a pull request
