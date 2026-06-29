# Chronos AI Backend System Documentation

Welcome to the backend server architecture of **Chronos AI**. This server operates as a full-stack Node.js server using Express paired dynamically with Vite middleware to serve a high-performance Single Page Application (SPA).

---

## 🚀 Application Design

- **Runtime Environment:** Cloud Run Linux Containerization
- **Backend Framework:** Node.js (v18+) with Express
- **Asset Compiler & Dev Server:** Vite with Hot Module Replacement handling and static distribution fallbacks
- **AI Specialist SDK:** Modern `@google/genai` TypeScript SDK (model: `gemini-3.5-flash`)
- **Third-Party Integrations:** Google Workspace (Gmail API integration backed by secure OAuth 2.0 flow)

---

## 🛠️ Main Server Endpoints

### 1. System Information / Documentation
- **Route:** `GET /api/info`
- **Description:** Returns structured JSON metadata regarding core capabilities, dependencies, and diagnostic properties of Chronos AI.

### 2. OAuth Authentication
- **Route:** `GET /api/auth/google/url`
- **Description:** Generates the Google OAuth 2.0 Consent Screen URL with necessary Gmail scopes.
- **Route:** `GET /auth/callback`
- **Description:** Receives the Google callback code, exchanges it securely for user authorization credentials, and returns them to the parent window client frame.

### 3. Integrated Mail Workspace
- **Route:** `GET /api/emails`
- **Description:** Proxies authorized request with header credentials to retrieve the latest 10 Gmail messages, subject headers, sender identities, and body snippet previews.

---

## 📦 Key Backend Dependencies
- `express`: Micro-routing and middleware pipeline
- `googleapis`: Official Google Workspace client sdk
- `@google/genai`: Google DeepMind Gemini API wrapper for custom specialized chatbots
- `dotenv`: Fluid workspace configuration management
- `vite`: Dynamic client assets packaging

---

## 🔐 Environment variables requirements
Define these variables securely in your deployment configuration settings:
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GEMINI_API_KEY=
```
