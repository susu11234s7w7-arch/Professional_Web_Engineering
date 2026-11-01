# DevPulse — REST API Documentation

Base URL: `http://localhost:5000/api`

All API requests accepting a JSON body must include the `Content-Type: application/json` header.
Protected endpoints require the `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Descriptive message",
    "details": []
  }
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register New User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** No
- **Rate Limited:** Yes (max 10 requests / 15 minutes)

#### Request Body
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Doe"
}
```

#### Responses
- **201 Created**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_9f8e7d",
      "email": "developer@example.com",
      "fullName": "Jane Doe",
      "role": "MEMBER",
      "createdAt": "2026-11-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```
- **409 Conflict:** Email is already registered.
- **422 Unprocessable Entity:** Validation error (e.g. password under 8 characters).

---

### 2.2 Login User
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** No
- **Rate Limited:** Yes (max 10 requests / 15 minutes)

#### Request Body
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!"
}
```

#### Responses
- **200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_9f8e7d",
      "email": "developer@example.com",
      "fullName": "Jane Doe",
      "role": "MEMBER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```
- **401 Unauthorized:** Invalid email or password.

---

### 2.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)

#### Responses
- **200 OK**
```json
{
  "success": true,
  "data": {
    "id": "usr_9f8e7d",
    "email": "developer@example.com",
    "fullName": "Jane Doe",
    "role": "MEMBER",
    "createdAt": "2026-11-01T12:00:00.000Z"
  }
}
```
- **401 Unauthorized:** Missing or invalid token.

---

## 3. Project Endpoints (`/api/projects`)

### 3.1 List Projects
- **Method:** `GET`
- **Path:** `/api/projects`
- **Auth Required:** Yes
- **Query Parameters:**
  - `search` (optional): Filter by name or key.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "prj_001",
      "name": "DevPulse Core",
      "key": "DEV",
      "description": "Core platform and engine development",
      "ownerId": "usr_9f8e7d",
      "memberCount": 4,
      "issueCount": 18,
      "createdAt": "2026-11-01T12:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Create Project
- **Method:** `POST`
- **Path:** `/api/projects`
- **Auth Required:** Yes

#### Request Body
```json
{
  "name": "DevPulse Core",
  "key": "DEV",
  "description": "Core platform and engine development"
}
```

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "prj_001",
    "name": "DevPulse Core",
    "key": "DEV",
    "description": "Core platform and engine development",
    "ownerId": "usr_9f8e7d",
    "createdAt": "2026-11-01T12:00:00.000Z"
  }
}
```
- **409 Conflict:** Project key already exists.

---

### 3.3 Get Project Details & Metrics
- **Method:** `GET`
- **Path:** `/api/projects/:id`
- **Auth Required:** Yes

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prj_001",
    "name": "DevPulse Core",
    "key": "DEV",
    "description": "Core platform and engine development",
    "metrics": {
      "totalIssues": 24,
      "completedIssues": 14,
      "completionPercentage": 58.3,
      "byStatus": {
        "BACKLOG": 2,
        "TODO": 4,
        "IN_PROGRESS": 3,
        "IN_REVIEW": 1,
        "DONE": 14
      },
      "byPriority": {
        "LOW": 3,
        "MEDIUM": 11,
        "HIGH": 8,
        "URGENT": 2
      }
    }
  }
}
```

---

## 4. Issue Endpoints (`/api/issues`)

### 4.1 List Issues (with Filtering & Search)
- **Method:** `GET`
- **Path:** `/api/projects/:projectId/issues`
- **Auth Required:** Yes
- **Query Parameters:**
  - `status` (optional): `BACKLOG` | `TODO` | `IN_PROGRESS` | `IN_REVIEW` | `DONE`
  - `priority` (optional): `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `type` (optional): `BUG` | `FEATURE` | `TASK` | `IMPROVEMENT`
  - `assigneeId` (optional): User ID string
  - `search` (optional): Text search query against title and description

#### Response: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "iss_a1b2",
      "projectId": "prj_001",
      "issueNumber": 1,
      "key": "DEV-1",
      "title": "Implement rate limiting middleware",
      "description": "Protect auth endpoints from brute force attempts",
      "status": "DONE",
      "priority": "HIGH",
      "type": "FEATURE",
      "assigneeId": "usr_9f8e7d",
      "assigneeName": "Jane Doe",
      "reporterId": "usr_9f8e7d",
      "dueDate": "2026-11-10",
      "createdAt": "2026-11-01T12:00:00.000Z",
      "updatedAt": "2026-11-01T14:30:00.000Z"
    }
  ]
}
```

---

### 4.2 Create Issue
- **Method:** `POST`
- **Path:** `/api/projects/:projectId/issues`
- **Auth Required:** Yes

#### Request Body
```json
{
  "title": "Add Kanban board drag and drop",
  "description": "Allow dragging cards across status columns",
  "priority": "HIGH",
  "type": "FEATURE",
  "status": "TODO",
  "assigneeId": "usr_9f8e7d",
  "dueDate": "2026-11-15"
}
```

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "iss_c3d4",
    "projectId": "prj_001",
    "issueNumber": 2,
    "key": "DEV-2",
    "title": "Add Kanban board drag and drop",
    "description": "Allow dragging cards across status columns",
    "status": "TODO",
    "priority": "HIGH",
    "type": "FEATURE",
    "assigneeId": "usr_9f8e7d",
    "reporterId": "usr_9f8e7d",
    "dueDate": "2026-11-15",
    "createdAt": "2026-11-01T14:45:00.000Z"
  }
}
```

---

### 4.3 Update Issue Details / Status
- **Method:** `PATCH`
- **Path:** `/api/issues/:id`
- **Auth Required:** Yes

#### Request Body (Partial updates allowed)
```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "iss_c3d4",
    "key": "DEV-2",
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "updatedAt": "2026-11-01T15:00:00.000Z"
  }
}
```

---

### 4.4 Delete Issue
- **Method:** `DELETE`
- **Path:** `/api/issues/:id`
- **Auth Required:** Yes

#### Response: `200 OK`
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 5. Comments & Activity Endpoints

### 5.1 Add Comment
- **Method:** `POST`
- **Path:** `/api/issues/:issueId/comments`
- **Auth Required:** Yes

#### Request Body
```json
{
  "content": "PR is open and ready for code review."
}
```

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "comm_7x8y",
    "issueId": "iss_c3d4",
    "userId": "usr_9f8e7d",
    "authorName": "Jane Doe",
    "content": "PR is open and ready for code review.",
    "createdAt": "2026-11-01T15:05:00.000Z"
  }
}
```

---

### 5.2 Get Issue Activity Stream
- **Method:** `GET`
- **Path:** `/api/issues/:issueId/activity`
- **Auth Required:** Yes

#### Response: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "act_1",
      "issueId": "iss_c3d4",
      "userId": "usr_9f8e7d",
      "userName": "Jane Doe",
      "action": "STATUS_CHANGED",
      "fieldChanged": "status",
      "oldValue": "TODO",
      "newValue": "IN_PROGRESS",
      "createdAt": "2026-11-01T15:00:00.000Z"
    }
  ]
}
```

---

## 6. System Health Endpoint

### 6.1 Health Check
- **Method:** `GET`
- **Path:** `/api/health`
- **Auth Required:** No

#### Response: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-11-01T15:10:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

