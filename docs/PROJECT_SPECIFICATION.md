# DevPulse — Project Specification

## 1. Project Overview
**DevPulse** is an open-source, full-stack team issue and project tracking web application designed for agile engineering teams. It bridges modern project management workflows—such as Kanban boards, sprint tracking, real-time activity logging, and issue triage—with an intuitive, developer-centric interface and a resilient RESTful backend.

## 2. Problem Statement
Many existing project management tools are either overly heavyweight, slow, and laden with enterprise bloat (e.g., traditional Jira setups), or too rudimentary to support real engineering workflows (e.g., basic to-do apps). Modern software teams need a fast, transparent, and self-hostable workspace where:
- Issues and bug reports can be triaged rapidly across customizable workflows (`Backlog`, `Todo`, `In Progress`, `In Review`, `Done`).
- Every issue change (status transitions, priority shifts, assignments) creates an immutable audit trail.
- Teams have clear visibility into project health and velocity via automated statistics.
- Developers and contributors can clone, run, and self-host the entire platform with zero external vendor lock-in.

## 3. Target Audience
- **Software Engineering Teams & Leads:** Needing a fast, keyboard-accessible issue tracker to manage sprints, bug queues, and feature requests.
- **Product Managers & QA Engineers:** Needing clear acceptance criteria, bug reporting workflows, priority classification, and progress analytics.
- **Open-Source Contributors & Developers:** Looking for an exemplary, production-grade TypeScript full-stack reference implementation that demonstrates clean architecture, testing, and DevOps best practices.

## 4. Functional Requirements

### 4.1 Authentication & User Management
- **FR-AUTH-1:** Secure user registration with email, full name, and password validation (minimum 8 characters, requiring at least one letter and one number).
- **FR-AUTH-2:** User login returning a signed JSON Web Token (JWT) with standard expiration.
- **FR-AUTH-3:** Password hashing using `bcryptjs` with high salt work factors (10+ rounds).
- **FR-AUTH-4:** User profile retrieval and session verification via `GET /api/auth/me`.
- **FR-AUTH-5:** Role-based access controls (`ADMIN`, `MEMBER`, `VIEWER`).

### 4.2 Project Management
- **FR-PROJ-1:** Create, read, update, and delete (CRUD) projects.
- **FR-PROJ-2:** Unique project key generation (e.g., `DEV`, `PULSE`, `CORE`) used for issue identifiers (`DEV-1`, `DEV-2`).
- **FR-PROJ-3:** Project member assignment and role designation.
- **FR-PROJ-4:** Project metrics summary endpoint returning real-time aggregate stats (total issues, open vs. closed, breakdown by status and priority).

### 4.3 Issue & Task Tracking
- **FR-ISSUE-1:** Create issues under a specific project with title, description (Markdown-ready), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), type (`BUG`, `FEATURE`, `TASK`, `IMPROVEMENT`), status (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), due date, and assignee.
- **FR-ISSUE-2:** View issues in both **Interactive Kanban Board** (drag/drop or click-to-move across status columns) and **Tabular List** view.
- **FR-ISSUE-3:** Update issue status, priority, assignee, description, and details with validation.
- **FR-ISSUE-4:** Soft or cascading delete for issues with permission checks.
- **FR-ISSUE-5:** Full-text search and multi-facet filtering (filter by status, priority, assignee, and keyword search).

### 4.4 Comments & Activity Logging (Audit Trail)
- **FR-COMM-1:** Users can post comments on issues with author attribution and timestamps.
- **FR-COMM-2:** Automatic activity logging for critical lifecycle events: issue creation, status transition, priority change, and assignment update.
- **FR-COMM-3:** Activity stream timeline rendered on issue detail view.

## 5. Non-Functional Requirements

### 5.1 Reliability & Data Integrity
- Relational schema enforced with foreign key constraints, unique indexes, and SQLite WAL (Write-Ahead Logging) mode.
- ACID transaction handling for multi-step database mutations (e.g., issue creation + activity log insertion).

### 5.2 Performance & Responsiveness
- Backend API response latency $< 50\text{ ms}$ for standard queries.
- Fast frontend initial load using Vite code-splitting and asset minification.
- Optimistic UI updates for Kanban status movements with automatic rollback on network failure.

### 5.3 Security
- Parameterized SQL queries to prevent SQL injection vulnerabilities.
- Request payload validation using strict Zod schemas on all API inputs.
- HTTP security headers powered by `helmet` (Content Security Policy, X-Frame-Options, HSTS).
- CORS configuration restricting unauthorized origins.
- Rate limiting on authentication endpoints to deter brute-force attacks.
- Zero secrets committed to version control; safe `.env.example` templates.

### 5.4 Maintainability & Testability
- Separation of concerns: Controller $\to$ Service $\to$ Data Access Layer.
- Comprehensive automated test coverage: unit tests for utilities/services and integration tests for all REST API endpoints using Vitest and Supertest.
- Strict TypeScript type safety across frontend and backend.

## 6. Main Features
1. **Interactive Kanban Board:** Visual drag/click pipeline spanning `Backlog` to `Done`.
2. **Advanced Issue Triage & Filtering:** Instant live search by keyword, priority, and assignee.
3. **Project Health Dashboard:** Visual progress ring, issue distribution charts, and velocity counters.
4. **Audit Trail & Activity Stream:** Transparent chronological timeline of team actions.
5. **Role-Based Workspace:** Differentiated permissions for Admins and Team Members.
6. **Dark / Light Theme:** Modern accessible UI designed for developer comfort.

## 7. Technical Constraints
- **Runtime:** Node.js $\ge 18$ (tested on Node.js v20 LTS).
- **Language:** TypeScript 5.x throughout (strict mode enabled).
- **Database:** SQLite (via `better-sqlite3` or `sqlite3` driver) for zero-setup, zero-external-dependency local development and reproducible testing.
- **Portability:** Self-contained without requiring external cloud accounts or external daemon setup.

## 8. Acceptance Criteria
- [x] All API endpoints return appropriate status codes (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `500`).
- [x] Unauthenticated users are strictly barred from accessing protected project/issue endpoints.
- [x] Form inputs are validated with explicit, friendly error messages.
- [x] Database migrations create required tables, indexes, and constraints idempotently.
- [x] Automated test suite runs with 100% pass rate.
- [x] Production build completes without TypeScript or bundler errors.
- [x] Another developer can run `git clone`, `npm install`, `npm test`, and `npm run dev` to get a fully working application in under two minutes.

