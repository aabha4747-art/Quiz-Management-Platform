# 🧬 BioNova – Biotechnology Quiz & Learning Platform

BioNova is a full-stack biotechnology learning and assessment platform designed to help students learn, test, and strengthen their biotechnology knowledge through interactive quizzes, progress tracking, gamification, analytics, leaderboards, and certificates.

The platform provides separate **Student** and **Admin** experiences with secure authentication, role-based authorization, quiz management, detailed performance tracking, and a modern biotechnology-focused interface.

---

## 🌐 Live Application

### Frontend

https://quiz-management-frontend-tbmj.onrender.com

### Backend API

https://quiz-management-api-3kef.onrender.com/api

### API Health Check

https://quiz-management-api-3kef.onrender.com/api/health

---

## ✨ Key Features

### 👩‍🎓 Student Features

- Student registration and login
- Secure JWT-based authentication
- Personalized BioNova onboarding
- Student profile setup
- Biotechnology-focused dashboard
- Browse available quizzes
- Browse quizzes by biotechnology category
- View quiz details before attempting
- Timed quiz attempts
- Question-by-question navigation
- Automatic answer saving
- Multiple quiz attempts
- Automatic submission when time expires
- Instant score calculation
- Pass/fail result calculation
- Detailed result page
- Review correct and incorrect answers
- Question explanations
- Complete attempt history
- Progress analytics
- Category-wise performance tracking
- XP-based progression system
- Student levels
- Daily learning streaks
- Achievements
- Leaderboard rankings
- Certificates
- Notifications
- Student profile management

---

## 🛡️ Admin Features

- Secure admin login
- Role-based admin authorization
- Admin dashboard
- Category management
- Create biotechnology categories
- Edit categories
- Delete categories
- Quiz management
- Create quizzes
- Edit quizzes
- Delete quizzes
- Publish and unpublish quizzes
- Question management
- Add questions to quizzes
- Edit existing questions
- Delete questions
- Manage answer options
- Configure correct answers
- Student management
- View registered students
- Quiz statistics
- Student performance statistics
- Attempt analytics
- Pass/fail analytics
- Administrative performance insights

---

## 🧪 Biotechnology Learning Areas

BioNova is designed to support quizzes across biotechnology subjects such as:

- Cell Biology
- Molecular Biology
- Genetics
- Microbiology
- Biochemistry
- Immunology
- Bioinformatics
- Recombinant DNA Technology
- Industrial Biotechnology
- Pharmaceutical Biotechnology
- Plant Biotechnology
- Omics Technology
- Bioprocess Engineering
- Molecular Diagnostics

---

## 💻 Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt
- Express Validator
- Helmet
- CORS
- Express Rate Limit
- Multer
- Nodemailer

### Database

- PostgreSQL

### Deployment

- Render Static Site – Frontend
- Render Web Service – Backend
- Render PostgreSQL – Production Database
- GitHub – Source Control
- GitHub + Render – Automatic Deployment

---

## 🏗️ Project Architecture

```text
Quiz-Management-Platform/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── public/
│   │   │   └── student/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Authorization

BioNova uses **JWT-based authentication** to secure the application.

The authentication system ensures that:

- Unauthenticated users cannot access protected pages
- Students can access student functionality
- Admin users can access administrative functionality
- Role-based authorization protects sensitive routes
- Authentication persists across browser refreshes
- Logout removes the stored authentication session
- Passwords are securely hashed before being stored

---

## 🔄 Student Learning Flow

```text
Home Page
    ↓
Register / Login
    ↓
Student Onboarding
    ↓
Student Dashboard
    ↓
Browse Quizzes
    ↓
Select Quiz
    ↓
Quiz Details
    ↓
Start Quiz
    ↓
Answer Questions
    ↓
Review Answers
    ↓
Submit Quiz
    ↓
Score Calculation
    ↓
Result Page
    ↓
Attempt History
    ↓
Progress Analytics
    ↓
XP / Levels / Streaks
    ↓
Leaderboard
    ↓
Certificates
```

---

## 📝 Quiz System

The BioNova quiz system supports:

- Timed assessments
- Multiple-choice questions
- Passing score configuration
- Multiple quiz attempts
- Automatic answer saving
- Question navigation
- Quiz progress tracking
- Automatic submission when the timer expires
- Score calculation
- Pass/fail calculation
- Correct answer review
- Incorrect answer review
- Question explanations
- Attempt history
- Student performance tracking

---

## 🎮 Gamification System

BioNova uses gamification to encourage continuous learning.

Students can earn and track:

### XP

Students receive experience points based on their learning activity and quiz performance.

### Levels

XP contributes toward student level progression.

### Learning Streaks

Students can maintain learning streaks through regular activity.

### Achievements

Achievements reward important learning milestones.

### Leaderboard

Students can compare their progress and performance with other learners.

### Certificates

Eligible quiz completions can generate certificates demonstrating student achievement.

---

## 📊 Progress Analytics

Students can monitor their learning performance through analytics including:

- Total quiz attempts
- Average score
- Highest score
- Pass rate
- Correct answers
- Incorrect answers
- Total questions attempted
- Category-wise performance
- XP progression
- Learning streaks
- Achievements

---

## 🗄️ Database

BioNova uses **PostgreSQL** for persistent application data.

The database stores information related to:

- Users
- Student profiles
- Categories
- Quizzes
- Questions
- Answer options
- Quiz attempts
- Student answers
- Progress
- XP
- Levels
- Learning streaks
- Achievements
- Leaderboard data
- Certificates
- Notifications

---

## ⚙️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aabha4747-art/Quiz-Management-Platform.git
```

Move into the project:

```bash
cd Quiz-Management-Platform
```

---

## 🖥️ Backend Setup

Move into the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_platform
DB_USER=postgres
DB_PASSWORD=your_postgres_password

ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_email_app_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

PASSWORD_RESET_EXPIRES_MINUTES=15

CLIENT_URL=http://localhost:5173
```

> Never commit your real `.env` file, database password, Gmail App Password, JWT secret, or admin password to GitHub.

Start the development server:

```bash
npm run dev
```

The backend should run locally at:

```text
http://localhost:5000
```

---

## 🎨 Frontend Setup

Open another terminal and move into the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend should run locally at:

```text
http://localhost:5173
```

---

## 🌍 Environment Variables

### Backend Environment Variables

```text
PORT
NODE_ENV

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD

EMAIL_USER
EMAIL_APP_PASSWORD

JWT_SECRET
JWT_EXPIRES_IN

PASSWORD_RESET_EXPIRES_MINUTES

CLIENT_URL
```

### Frontend Environment Variable

```text
VITE_API_URL
```

For production:

```env
VITE_API_URL=https://quiz-management-api-3kef.onrender.com/api
```

---

## 🚀 Production Deployment

BioNova is deployed using **Render**.

### Frontend – Render Static Site

Configuration:

```text
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variable:

```text
VITE_API_URL=https://quiz-management-api-3kef.onrender.com/api
```

---

### Backend – Render Web Service

Configuration:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Production backend environment variables are configured securely through the Render dashboard.

---

### Database – Render PostgreSQL

The production application uses a Render-hosted PostgreSQL database.

The backend connects to the production PostgreSQL instance using environment variables rather than hard-coded credentials.

---

## 🔒 Security

BioNova implements several security practices, including:

- Password hashing
- JWT authentication
- Role-based authorization
- Protected API routes
- Input validation
- Rate limiting
- Helmet security headers
- CORS configuration
- Environment-variable-based secret management
- `.env` protection through `.gitignore`
- Authentication middleware
- Authorization middleware

Sensitive credentials are **not stored directly in the source code**.

---

## ❤️ API Health Check

The backend provides health-check endpoints to verify deployment.

### API Status

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Quiz Platform API is running"
}
```

### PostgreSQL Status

```http
GET /api/health/database
```

A successful response confirms that the backend can communicate with the production PostgreSQL database.

---

## ✅ Functionality Tested

The production application has been tested successfully for the following functionality:

### Authentication

- Registration
- Student login
- Admin login
- Logout
- Authentication persistence
- Protected routes
- Role-based authorization

### Student

- Student onboarding
- Dashboard
- Browse quizzes
- Quiz details
- Start quiz
- Answer questions
- Submit quiz
- Result calculation
- Result review
- Attempt history
- Progress analytics
- XP
- Levels
- Learning streaks
- Leaderboard
- Achievements
- Certificates

### Admin

- Admin dashboard
- Category management
- Quiz management
- Question management
- Student management
- Analytics

### Production

- Frontend deployment
- Backend deployment
- PostgreSQL connection
- Frontend-to-backend API communication
- Production authentication
- Production quiz flow
- Production database persistence

---

## 📸 Screenshots

Project screenshots can be stored inside:

```text
docs/screenshots/
```

Recommended screenshots:

1. BioNova Home Page
2. Registration Page
3. Login Page
4. Student Onboarding
5. Student Dashboard
6. Browse Quizzes
7. Quiz Details
8. Quiz Attempt
9. Quiz Result
10. Attempt History
11. Progress Analytics
12. Leaderboard
13. Certificates
14. Admin Dashboard
15. Quiz Management
16. Admin Analytics

Example Markdown:

```markdown
![BioNova Home Page](docs/screenshots/home-page.png)
```

---

## 🔮 Future Enhancements

Future versions of BioNova could include:

- AI-generated biotechnology quizzes
- Adaptive quiz difficulty
- Personalized learning recommendations
- AI-powered explanations
- AI biotechnology tutor
- Personalized learning paths
- Advanced student analytics
- Question randomization
- Larger biotechnology question bank
- Course modules
- Study materials
- Flashcards
- Google authentication
- Cloud-based image storage
- Advanced certificate customization
- Mobile application
- Improved mobile responsiveness

---

## 🎯 Project Objective

The objective of BioNova is to create an engaging digital learning environment where biotechnology students can:

- Test their knowledge
- Identify weak concepts
- Track their learning progress
- Practice biotechnology topics
- Improve through repeated assessments
- Stay motivated using gamification
- Receive measurable evidence of progress

The administrative system enables educators or platform administrators to manage learning content and monitor student performance.

---

## 📌 Project Status

**Status: Fully Functional & Deployed**

The current production system successfully supports:

- Student authentication
- Admin authentication
- Student onboarding
- Biotechnology quizzes
- Quiz attempts
- Result calculation
- Attempt history
- Progress analytics
- XP and levels
- Learning streaks
- Leaderboards
- Achievements
- Certificates
- Admin content management
- Admin analytics
- PostgreSQL persistence
- Production deployment

---

## 👩‍💻 Author

**Aabha Tembhurne**

B.E. Biotechnology  
RV College of Engineering

---

## 📄 License

This project was developed for educational and academic purposes.