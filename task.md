# PostCreator - Project Task List

## Phase 1: Foundation & Infrastructure
- [x] **Repository & Environment Setup** <!-- id: 0 -->
    - [x] Initialize Git repository with branch protection (main, develop) <!-- id: 1 -->
    - [x] Create folder structure: `/frontend`, `/backend`, `/jobs`, `/docs`, `/tests` <!-- id: 2 -->
    - [x] Setup `.gitignore` <!-- id: 3a -->
    - [ ] Create `.env.example` and PR templates <!-- id: 3b -->
    - [x] Configure Code Quality tools (Prettier applied; ESLint deferred) <!-- id: 4 -->
- [ ] **Azure Infrastructure** <!-- id: 5 -->
    - [ ] Document Azure resource requirements (App Service, Cosmos, Static Web Apps, Key Vault) <!-- id: 6 -->
    - [ ] Configure Azure Application Insights <!-- id: 7 -->
- [x] **Database Design** <!-- id: 8 -->
    - [x] Design Mongoose schemas: Users, Posts, AuditLogs <!-- id: 9 -->
    - [x] Define indexes and relationships <!-- id: 11 -->
    - [x] Configure Connection Logic & Environment Variables <!-- id: 12 -->

## Phase 2: Authentication & Security
- [x] **User Authentication (Backend)** <!-- id: 13 -->
    - [x] Registration API (Email/Password, bcrypt) <!-- id: 14 -->
    - [x] Login API (JWT, 7-day expiry) <!-- id: 15 -->
    - [x] Session Management & Middleware <!-- id: 16 -->
    - [x] Password Reset/Forgot Password flow <!-- id: 17 -->
- [x] **User Authentication (Frontend)** <!-- id: 18 -->
    - [x] Registration & Login Forms <!-- id: 19 -->
    - [x] Protected Routes & Session Persistence <!-- id: 20 -->
- [x] **Twitter OAuth Integration** <!-- id: 21 -->
    - [x] Register App on Twitter Developer Portal <!-- id: 22 -->
    - [x] Implement OAuth Connection Flow (Backend) <!-- id: 23 -->
    - [x] Store Tokens in Database (User model) <!-- id: 24 -->
    - [x] "Connect Twitter" UI Component (Dashboard) <!-- id: 25 -->
    - [x] Test End-to-End Flow with Real Credentials
    - [x] Implement Token Refresh Logic
- [x] **Security Hardening** <!-- id: 26 -->
    - [x] Implement Helmet.js, CORS <!-- id: 27a -->
    - [x] CSP, HSTS configuration (via Helmet) <!-- id: 27b -->
    - [x] Configure Rate Limiting (Global, Auth, & AI) <!-- id: 28 -->
    - [x] Input Validation (express-validator) & Sanitization <!-- id: 29 -->

## Phase 3: Core Features - Content Management
- [x] **Post Generation** <!-- id: 30 -->
    - [x] Backend: Generation service with Groq/LLM variations (Original, Emoji, Hashtag) <!-- id: 31 -->
    - [x] UI: Input form with character counter & variation selector <!-- id: 32 -->
- [x] **Post Scheduling** <!-- id: 33 -->
    - [x] Backend: Update post API with date/timezone validation <!-- id: 34 -->
    - [x] UI: Scheduler component (Date/Time picker, Timezone selector) <!-- id: 35 -->
- [x] **Post Management** <!-- id: 36 -->
    - [x] Edit Post Page (Content & Schedule updates)
    - [x] Post List Page (Filter, Search, Bulk Actions)
    - [x] Delete Post Functionality
- [x] **Dashboard** <!-- id: 37 -->
    - [x] Statistics Widgets (Total, Scheduled, Published, Failed) <!-- id: 38 -->
    - [x] Recent Posts Table with Status Badges
    - [ ] Upcoming Posts List & Calendar View <!-- id: 39 -->

## Phase 4: Background Jobs (Azure WebJobs)
- [ ] **Job Infrastructure** <!-- id: 40 -->
    - [ ] Setup WebJob project & CRON schedule (1 min) <!-- id: 41 -->
    - [ ] Implement Distributed Locking (Cosmos DB) <!-- id: 42 -->
- [ ] **Publishing Logic** <!-- id: 43 -->
    - [ ] Twitter API Wrapper (Publishing) <!-- id: 44 -->
    - [ ] Batch Processing & Status Updates <!-- id: 45 -->
    - [ ] Retry Mechanism (Exponential backoff) & Circuit Breaker <!-- id: 46 -->
    - [ ] Dead Letter Queue for failed posts <!-- id: 47 -->

## Phase 5: Monitoring & Observability
- [ ] **Instrumentation** <!-- id: 48 -->
    - [ ] Checkpoint: App Insights Integration <!-- id: 49 -->
    - [ ] Structured Logging (Winston) <!-- id: 50 -->
    - [ ] Custom Metrics (Post success/fail rates) <!-- id: 51 -->
- [ ] **Alerting** <!-- id: 52 -->
    - [ ] Configure Alerts (High Error Rate, Failed Jobs) <!-- id: 53 -->

## Phase 6: Testing
- [ ] **Unit Testing (Jest/Vitest)** <!-- id: 54 -->
    - [ ] Backend Services (>80% coverage) <!-- id: 55 -->
    - [ ] Frontend Components (>70% coverage) <!-- id: 56 -->
- [ ] **Integration & E2E** <!-- id: 57 -->
    - [ ] API Integration Tests <!-- id: 58 -->
    - [ ] E2E Flows (Playwright/Cypress) <!-- id: 59 -->
- [ ] **Load & Security Testing** <!-- id: 60 -->
    - [ ] Load Test with k6 (100 concurrent users) <!-- id: 61 -->
    - [ ] OWASP ZAP Security Scan <!-- id: 62 -->

## Phase 7: CI/CD & Deployment
- [ ] **Pipelines** <!-- id: 63 -->
    - [ ] GitHub Actions for Build & Test <!-- id: 64 -->
    - [ ] Deployment Pipelines (Staging, Prod) <!-- id: 65 -->
- [ ] **Documentation** <!-- id: 66 -->
    - [ ] API Documentation (Swagger) <!-- id: 67 -->
    - [ ] User & Ops Guides <!-- id: 68 -->
