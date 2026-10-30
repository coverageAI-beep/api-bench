# APIBench 🛠️

> **Local-First, Zero-Configuration API Documentation Workbench & Developer Sandbox**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)
[![Zero Cloud Lock-in](https://img.shields.io/badge/Storage-100%25%20Local%20Disk-emerald.svg?style=flat-square)]()

**APIBench** is a high-performance, developer-centric API documentation workbench. It gives you the full speed and privacy of local disk storage with the power of modern API testing, live cURL generation, OpenAPI/Postman interoperability, and AI prompt engineering for Cursor IDE—all without requiring an external database, mandatory SaaS subscriptions, or cloud lock-in.

---

## 📑 Table of Contents

- [Overview & Philosophy](#-overview--philosophy)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Requirements](#-system-requirements)
- [Complete Setup Guide](#-complete-setup-guide)
  - [1. Clone or Download](#1-clone-or-download)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Start the Application](#4-start-the-application)
- [Storage & Cloud Synchronization](#-storage--cloud-synchronization)
  - [Default Directory](#default-directory)
  - [Syncing with OneDrive or Dropbox](#syncing-with-onedrive-or-dropbox)
  - [Version Control with Git](#version-control-with-git)
  - [File Format Specification](#file-format-specification)
- [Cursor IDE & AI Blueprinting](#-cursor-ide--ai-blueprinting)
- [Import & Export Workflows](#-import--export-workflows)
- [Production Deployment](#-production-deployment)
  - [Production Build](#production-build)
  - [Docker Setup](#docker-setup)
- [Configuration Reference](#-configuration-reference)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 💡 Overview & Philosophy

Most API design tools today either force your team into closed cloud ecosystems with recurring fees, or suffer from clunky, bloated interfaces. **APIBench** was engineered around four core tenets:

1. **Local-First & Private**: Your API specs, keys, and schemas remain strictly on your physical machine. Nothing is transmitted to external telemetry servers.
2. **Zero-Config File Persistence**: APIs are serialized as standard `.json` files on your filesystem. You can view, diff, edit with Vim/VS Code, or version control them with Git anytime.
3. **Seamless Cloud Drive Integration**: Point your storage folder to your OneDrive, Google Drive, or Dropbox folder for instant cross-device synchronization without third-party plugins.
4. **AI-Ready Workflow**: Directly export specialized architectural prompts into Cursor, Claude, or GitHub Copilot to scaffold clean code, controllers, DTOs, and unit tests in seconds.

---

## ✨ Key Features

### 1. 🗂️ Clean API Specification & Management
- Organize endpoints intuitively by **Controller / Service** (`AuthController`, `BillingService`, `UsersController`).
- Comprehensive schema modeling: **Path Parameters**, **Query Parameters**, **HTTP Headers**, **Request Body** (JSON/raw/multipart), and **Response Status Codes** (200, 201, 400, 404, 500) with response body examples.
- Dedicated **Business Rules & Validation Logic** section to document domain invariant logic directly alongside the contract.

### 2. ⚡ Built-in Interactive Request Sandbox
- Fire live HTTP requests directly from the workbench.
- Dynamic path parameter interpolation (e.g. `/api/v1/orders/{orderId}`).
- Configurable base URL overrides per environment (`localhost:8080`, `dev.api.internal`, `api.production.com`).
- Live latency benchmarking, response status code badge, headers inspection, and formatted JSON viewer.

### 3. 📋 Real-Time cURL Generator
- Automatically generates copy-ready `curl` CLI commands as you edit your parameters, headers, and request body.
- One-click copy with instant visual feedback.

### 4. 🔄 Universal Import & Export
- **OpenAPI 3.0.3**: Export compliant OpenAPI specification for Swagger UI or API Gateway ingestion.
- **Postman Collection v2.1**: Import and export Postman collections with preserved folder structures, headers, and body payloads.
- **Markdown Documentation**: Generate polished, publication-ready Markdown documents formatted for GitHub READMEs, wikis, or Docusaurus.
- **Native JSON Backup**: Export and import complete workspace backups with single-click restore.

### 5. 🤖 Cursor IDE Integration
- Built-in **AI Prompt Blueprinter**: Generates rich context prompts containing full API schemas, validation constraints, and business rules.
- Pre-configured scaffolding prompts for:
  - **Spring Boot / Java** (REST Controllers & DTOs)
  - **Express / TypeScript** (Routers & Zod Validators)
  - **Go / Gin** (Handlers, Structs & Middleware)
  - **Python / FastAPI** (Pydantic Models & Route Definitions)
  - **Unit & Integration Tests** (Jest, PyTest, Supertest)

### 6. 🎨 Earth Pastel Minimalist UI
- Warm stone, terracotta, sage, and sand palette crafted to reduce eye strain during long development sessions.
- Visual HTTP method distribution charts (GET, POST, PUT, DELETE, PATCH).
- Search, filter by controller, filter by HTTP verb, and tag organization.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│   React 18 + TypeScript + Vite + Tailwind CSS v4 + Lucide   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                  Node.js / Express Server                   │
│   • REST Endpoints (/api/apis, /api/settings, /api/proxy)   │
│   • Native File System I/O (node:fs/promises)               │
│   • Safe Storage Path Resolver (node:path, node:os)         │
│   • High-Performance Vite Middlewares in Dev                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Serialized JSON Reads & Writes
┌──────────────────────────────▼──────────────────────────────┐
│                    Local Disk Storage                       │
│   ~/.apibench/data/apis/*.json  (or OneDrive / custom path) │
│   ~/.apibench/settings.json                                 │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TSX execution engine, native Node filesystem
- **Persistence**: Plain JSON files with sanitized slug identifiers (`[service]-[method]-[path].json`)

---

## 💻 System Requirements

- **Operating System**: macOS, Linux, or Windows 10/11 (WSL2 or native PowerShell)
- **Node.js**: v18.16.0 or higher (v20 LTS recommended)
- **Package Manager**: `npm` (bundled with Node), `pnpm`, `yarn`, or `bun`

---

## 🚀 Complete Setup Guide

### 1. Clone or Download

```bash
# Clone the repository
git clone https://github.com/your-username/apibench.git

# Navigate into the project directory
cd apibench
```

### 2. Install Dependencies

Install all required production and development dependencies using npm:

```bash
npm install
```

*(Alternatively, if you use `bun`: `bun install` or `pnpm`: `pnpm install`)*

### 3. Configure Environment Variables

Copy the example environment template:

```bash
cp .env.example .env
```

Review or modify `.env` as desired:

```env
# Port on which APIBench will listen (default: 3000)
PORT=3000

# Node Environment
NODE_ENV=development

# Optional: Custom storage directory (leave empty to use default ~/.apibench/data/apis)
# Examples:
# APIBENCH_STORAGE_DIR=/Users/username/OneDrive/APIBench
# APIBENCH_STORAGE_DIR=C:\Users\username\OneDrive\APIBench

# Optional: Cursor IDE API Key for direct proxy generation
CURSOR_API_KEY=
```

### 4. Start the Application

Start the full-stack development server:

```bash
npm run dev
```

The console will output:
```text
🚀 APIBench server running on http://localhost:3000
📂 Storage Directory: /Users/yourname/.apibench/data/apis
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 💾 Storage & Cloud Synchronization

### Default Directory
By default, APIBench stores all API documentation in your user home directory:
- **macOS / Linux**: `~/.apibench/data/apis/`
- **Windows**: `C:\Users\<YourUsername>\.apibench\data\apis\`
- **Settings File**: `~/.apibench/settings.json`

### Syncing with OneDrive or Dropbox
To synchronize your API specifications across machines using your cloud drive:
1. Open APIBench and click the **Settings** (⚙️) icon in the top header.
2. Select the **OneDrive / Cloud Sync** tab.
3. Enter your local OneDrive directory path (for example):
   - **Windows**: `C:\Users\alex\OneDrive\APIBench`
   - **macOS**: `/Users/alex/OneDrive/APIBench`
   - **Linux**: `/home/alex/Dropbox/APIBench`
4. Click **Update Storage Directory**.
5. APIBench will automatically create the folder if it does not exist, initialize file permissions, and start writing all future `.json` endpoint files directly there.

### Version Control with Git
Because every endpoint is stored as an individual human-readable JSON file, you can initialize a Git repository inside your storage directory:

```bash
cd ~/.apibench/data/apis
git init
git remote add origin git@github.com:your-org/my-api-specs.git
git add .
git commit -m "feat: document authentication endpoints"
git push -u origin main
```

This gives your team automated versioning, peer reviews on pull requests, and commit histories on API contracts.

### File Format Specification
Each endpoint is saved as `[controller]-[method]-[path].json` with the following clean schema:

```json
{
  "id": "authcontroller-post-api-v1-auth-login",
  "title": "User Authentication & JWT Token Issuance",
  "service": "AuthController",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "summary": "Authenticates user credentials and returns an access JWT and refresh token.",
  "businessRules": "1. Rate-limit to 5 attempts per IP per minute.\n2. Inactive accounts must return 403 Forbidden.",
  "headers": [
    { "key": "Content-Type", "value": "application/json", "required": true, "description": "JSON payload" }
  ],
  "pathParams": [],
  "queryParams": [],
  "requestBody": {
    "contentType": "application/json",
    "rawBody": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
  },
  "responses": [
    {
      "code": 200,
      "description": "Authenticated successfully",
      "body": "{\n  \"token\": \"eyJhbGciOi...\",\n  \"expiresIn\": 3600\n}"
    },
    {
      "code": 401,
      "description": "Invalid credentials",
      "body": "{\n  \"error\": \"INVALID_CREDENTIALS\"\n}"
    }
  ],
  "createdAt": "2026-10-30T09:00:00.000Z",
  "updatedAt": "2026-10-30T09:00:00.000Z"
}
```

---

## 🤖 Cursor IDE & AI Blueprinting

APIBench bridges the gap between API specifications and AI-assisted programming tools like **Cursor IDE**, **GitHub Copilot**, and **Claude Code**.

### How to Use the Cursor Blueprint:
1. Select any endpoint from your APIs list.
2. Click the **Cursor Blueprint** button in the endpoint header.
3. Select your desired scaffolding target:
   - **Backend Controller & DTOs**
   - **Client SDK & Fetch Functions**
   - **Automated Integration Tests**
   - **Mock Data Generator**
4. Click **Copy Prompt to Clipboard**.
5. Switch to **Cursor IDE**, open Composer or Chat (`Ctrl+I` / `Cmd+I`), and paste.
6. The AI will immediately generate production code adhering strictly to your documented business rules, parameter constraints, and response schemas.

---

## 📥 Import & Export Workflows

### Exporting Documentation
Click the **Export** button in the header or inside an endpoint modal to choose:
- **OpenAPI 3.0.3 (JSON)**: Standard specification ready for Swagger UI, Postman, or AWS API Gateway.
- **Postman Collection (v2.1)**: Import directly into Postman desktop or web client.
- **Markdown (.md)**: Pre-formatted GitHub-ready documentation with request tables, response samples, and cURL snippets.
- **Complete Workspace Backup**: Full JSON backup of all registered endpoints.

### Importing Documentation
1. Click **Import** in the top navigation.
2. Drag and drop any `.json` file containing:
   - An OpenAPI 3.0 / Swagger specification
   - A Postman Collection v2.1 JSON
   - A previously exported APIBench backup file
3. The parser will detect the format, validate the structure, and save individual files to your active storage directory.

---

## 🚢 Production Deployment

### Production Build
To build and run APIBench in a production environment:

```bash
# 1. Compile TypeScript and Vite production bundle
npm run build

# 2. Run the production Node.js server
npm start
```

### Docker Setup
You can also run APIBench inside a lightweight Docker container with persistent volume mounting:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/tsconfig.json ./

# Create data volume directory
RUN mkdir -p /data/apis
ENV APIBENCH_STORAGE_DIR=/data/apis

EXPOSE 3000
CMD ["node", "--loader", "tsx", "server.ts"]
```

Run with persistent local storage:
```bash
docker run -d \
  -p 3000:3000 \
  -v ~/my-apis:/data/apis \
  --name apibench \
  apibench:latest
```

---

## ⚙️ Configuration Reference

Access the **Settings** modal (⚙️) anytime to configure:

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Workspace Name** | `Production API Workspace` | Displays in the header and export files |
| **Default Base URL** | `http://localhost:8080` | Prefix for cURL and interactive sandbox testing |
| **Request Timeout** | `30s` | Maximum wait duration before sandbox timeout |
| **Auto-Format JSON** | `Enabled` | Automatically prettifies request and response bodies |
| **Global Authorization** | `None` | Default `Bearer <token>` or `ApiKey <key>` for tests |
| **Storage Directory** | `~/.apibench/data/apis` | Physical folder on disk where JSON files are saved |

---

## ❓ Troubleshooting & FAQ

### Q: Port 3000 is already in use
**Solution**: Run with a custom port:
```bash
PORT=3005 npm run dev
```

### Q: My browser blocks sandbox requests (CORS error)
**Solution**:
1. In the Endpoint Sandbox, enable the **Use Proxy** toggle.
2. The Node.js backend will execute the request on your behalf and relay the response, bypassing browser cross-origin restrictions.

### Q: How do I backup all my documentation?
**Solution**:
You have two easy options:
1. Open **Settings -> Backup & Restore -> Export Workspace JSON**.
2. Or simply copy or archive your storage folder (e.g., `tar -czvf apis.tar.gz ~/.apibench/data/apis`).

---

## 📄 License

APIBench is open-source software licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it for personal or commercial projects.
