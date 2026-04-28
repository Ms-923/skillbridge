# SkillBridge

SkillBridge is an open-innovation platform that connects talented contributors with organizations that need help on real tasks.  
It makes collaboration easier with role-based dashboards, task discovery, and AI-powered assistance.

## Project Purpose

- Connect **Contributors** and **Organizations** in one place.
- Help organizations publish tasks and find suitable talent faster.
- Help contributors discover impactful opportunities and track progress.
- Use AI support to improve productivity and matching workflows.

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend
- Node.js + Express
- TypeScript (`tsx` runtime)
- MongoDB + Mongoose
- JWT authentication

### AI Integration
- Google Gemini API (`@google/genai`)

## Clone and Run Locally

### 1) Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas connection string
- Gemini API key

### 2) Clone the repository
```bash
git clone https://github.com/Ms-923/skillbridge.git
cd skillbridge
```

### 3) Install dependencies
```bash
npm install
```

### 4) Configure environment variables
Create a `.env` file in the project root (you can copy from `.env.example`) and set:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:3000
```

### 5) Start the app
```bash
npm run dev
```

The app will run on:
- `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server (Express + Vite middleware)
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build
- `npm run start` - Start server
- `npm run lint` - Type-check project

---

Built for collaboration, impact, and real-world skill growth.
