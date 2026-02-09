# PostCreator Frontend

A premium, high-performance React application for generating and scheduling Twitter posts. Built with a focus on visual excellence and user experience.

## ✨ Key Features

- **AI Post Generation**: Create content variations using Groq/LLM integration.
- **Visual Scheduler**: Interactive calendar view and time-picker for precise scheduling.
- **Real-time Dashboard**: Monitor post status (Scheduled, Published, Failed) at a glance.
- **Premium UI**: Modern dark-mode aesthetic with glassmorphism and smooth animations.
- **Twitter OAuth 2.0**: Secure authentication with PKCE and automatic token management.

## 🛠 Tech Stack

- **Core**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Styling**: Vanilla CSS (Custom Premium Design System)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running (refer to the root documentation)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (create a `.env` file):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev`: Start development server on `127.0.0.1:5173`.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint for code quality checks.
- `npm run test`: Run the test suite using Jest.
- `npm run format`: Format code using Prettier.

## 📂 Project Structure

- `src/components`: Reusable UI components (Scheduler, Navbar, etc.).
- `src/pages`: Main application views (Dashboard, Calendar, Post Management).
- `src/context`: React Context providers (AuthContext).
- `src/api`: Axios instance and API call definitions.
- `src/index.css`: Core design system and global styles.

---

Built with ❤️ for social media automation.
