Thumblify – AI Thumbnail Generator

Thumblify is a full-stack web application that lets users generate AI-powered thumbnails instantly. Built with React + TypeScript on the frontend and Node.js + Express on the backend, it demonstrates professional full-stack development skills including authentication, API integration, and state management.

🚀 Features
User Authentication: Signup, login, logout
Thumbnail Generation: AI-powered thumbnail creation
Auto Login: Persist user sessions via cookies/JWT
Notifications: Real-time feedback using react-hot-toast
Responsive UI: Clean, intuitive, mobile-friendly
Error Handling: Handles unauthorized access and API errors
🛠 Tech Stack

Frontend:

React + TypeScript
Context API for global state
Axios for API calls
react-hot-toast for notifications
Tailwind CSS or custom CSS

Backend:

Node.js + Express
MongoDB / MySQL for database (as per your setup)
JWT or cookie-based authentication
RESTful APIs for user management & thumbnail generation

📁 Project Structure
Backend (Node.js + Express)
backend/
├─ controllers/        # Request handlers (auth, thumbnail)
├─ routes/             # API routes
├─ models/             # Database models
├─ middlewares/        # Auth middleware, error handling
├─ utils/              # Helper functions (e.g., API calls)
├─ server.js           # Express server entry point
└─ package.json        # Node dependencies & scripts
Frontend (React)
frontend/
├─ src/
│  ├─ assets/          # Types, icons, images
│  ├─ components/      # Reusable UI components
│  ├─ context/         # Auth context & hooks
│  ├─ configs/         # Axios instance & API config
│  ├─ pages/           # Pages (Generate, Login, Signup)
│  ├─ App.tsx          # Main app component
│  └─ main.tsx         # Entry point

⚡ Setup Instructions
Backend Setup (Node.js + Express)
Clone the repo
git clone https://github.com/nikhilkeshavmali/thumblify.git
cd thumblify/backend
Install dependencies
npm install
Configure environment variables (.env)
PORT=3000
DB_URI=your_database_uri
JWT_SECRET=your_jwt_secret
Start backend server
npm run dev       # Using nodemon for development

Backend runs on http://localhost:3000

Frontend Setup (React + TypeScript)
Navigate to frontend folder
cd ../frontend
Install dependencies
npm install
Configure environment variables (.env)
VITE_API_URL=http://localhost:3000/api
Start frontend server
npm run dev

Frontend runs on http://localhost:5173

📝 Usage
Open the frontend in your browser
Signup/Login to create an account
Use the Generate Thumbnail page to create thumbnails
View/download generated thumbnails

🛡 Error Handling
401 Unauthorized – Users must log in to access APIs
Network Errors – Toast notifications inform users
Form Validation – Prevents submission of invalid/empty data

🤝 Contributing
Fork the repo
Create a branch: git checkout -b feature-name
Commit changes: git commit -m "Add feature"
Push branch: git push origin feature-name
Open a Pull Request

🎯 Key Highlights for Job Interviews
Full-stack experience with React + Node.js/Express
REST API integration with JWT authentication
Proper state management with Context API
Professional error handling & notifications
Deployment-ready project structure
