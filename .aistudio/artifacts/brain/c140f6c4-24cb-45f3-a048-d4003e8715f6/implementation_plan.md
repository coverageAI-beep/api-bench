# APIBench - Personal Local-First API Documentation Workbench

A lightweight, single-user API documentation workbench designed to be cloned and run locally with zero configuration. APIBench provides a distraction-free, pastel earth-toned visual environment where developers can document endpoints, catalog request/response models, write rich business rules, generate copyable cURL commands, and export full specifications to OpenAPI 3.1, Postman Collections, Markdown, and JSON.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned with your preferences and will govern the build:

- **Confirmed Aesthetic**: **"The Warm Workshop" pastel earth palette** using Warm Sand (`#F7F5F0`) as the canvas, Warm Bone for surfaces, Pressed Linen borders (`#E3DDD3`), Deep Espresso typography (`#292524`), and Terracotta Clay (`#C26D53`) as the primary brand action color. HTTP methods are color-coded in muted mineral tones: Muted Sage (`GET`), Weathered Denim (`POST`), Baked Ochre (`PUT`), Dusty Lavender (`PATCH`), and Faded Terracotta (`DELETE`).
- **Confirmed Data Model & Storage**: Modular, local-first file-backed storage structure where endpoints can be managed individually. The application initializes with an in-browser local persistence layer synchronized with downloadable modular file archives and live disk-compatible JSON structures, eliminating merge conflicts and external database friction.
- **Confirmed Initial Seeding**: Ships with realistic pre-populated microservice APIs across `AuthController`, `UserController`, and `BillingController` so that the Dashboard charts, metrics, and API tables are immediately rich and interactive upon launch.
- **Confirmed Export Suite**: The "Export all APIs" trigger provides one-click exports for:
  1. **OpenAPI 3.1.0 JSON** (industry standard specification for Swagger/Redoc).
  2. **Postman Collection v2.1.0 JSON** (importable directly into Postman).
  3. **Markdown Documentation (`API_DOCS.md`)** (clean, formatted documentation for Git repos).
  4. **Raw JSON Backup** (complete portable state).

---

## 1. Overview & Core Concept

### What It Does
APIBench is a self-contained local developer application for defining and browsing API specifications without the bloat, login gates, or cloud synchronization of SaaS tools. An engineer clones the repository, runs it locally, and immediately accesses:
- A high-level **Dashboard** summarizing endpoint health, HTTP method breakdown (interactive donut/pie chart), and service controller distribution (horizontal bar chart).
- An **APIs Directory** table with instant search, method filtering, and controller tags.
- An **API Details View** showcasing route parameters, headers, multi-status responses, rich formatted **Business Rules**, and a one-click terminal-ready cURL command generator.
- An **API Form Editor** to add or edit endpoints effortlessly with validation and structured key-value editors.

### Target Audience & Persona
Individual software engineers, backend developers, and tech leads who want to maintain clean, version-controllable API documentation alongside their codebase with zero overhead.

### Key Value
- **Zero Cloud Dependence**: Runs completely offline on `localhost`.
- **First-Class Business Rules**: Captures the operational "why" and domain edge cases that standard OpenAPI generators miss.
- **Zero Setup Fatigue**: No Docker setups, database migrations, or authentication walls.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard Overview**:
   - The user opens `http://localhost:3000` and lands on the **Dashboard**.
   - The top action bar displays **`+ ADD NEW API`** and **`Export all APIs ▾`**.
   - Three primary summary cards display:
     - **Total Endpoints**: Giant tabular figure with service count and last updated timestamp.
     - **HTTP Methods Breakdown**: Interactive pastel earth donut chart with color-coded mineral legends.
     - **Service / Controller Distribution**: Horizontal bar chart comparing controller loads (`UserController`, `BillingController`, `AuthController`).
   - A **Recent Activity** list allows 1-click jumps to recently modified endpoints.

2. **Browsing & Inspecting APIs**:
   - Clicking **APIs** on the left navigation opens the full tabular catalog.
   - Users can search by path, title, controller, or keywords inside business rules.
   - Filter chips allow instant toggling between `ALL`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
   - Clicking any row navigates to the **API Details Screen**.

3. **API Details & Testing**:
   - Displays the method badge, full endpoint route, and controller name.
   - **Copy cURL**: Instantly constructs a formatted bash cURL command with appropriate headers, query parameters, and example payload, copying it to clipboard with a visual confirmation toast.
   - **Business Rules Section**: Prominently formatted panel displaying validation requirements, authentication roles, and domain constraints.
   - **Response Tabs**: Switch between `200 OK`, `400 Bad Request`, `404 Not Found`, etc., with formatted syntax-highlighted JSON previews.
   - **Actions**: "Edit API" button (switches to pre-filled edit form) and "Delete API" (with confirmation dialog).

4. **Adding / Editing an API**:
   - Clean, structured form with sections:
     - *Basic Information*: Service name (with auto-suggest from existing controllers), Title, Path, and Method selector.
     - *Headers & Parameters*: Dynamic Key-Value-Required tables for Headers, Path Parameters, and Query Parameters.
     - *Request Body*: Content-type selector (`application/json`, `multipart/form-data`, `none`) and JSON editor.
     - *Multi-Status Responses*: Add multiple status codes (`200`, `201`, `400`, `422`, `500`), each with status text, description, and JSON response example.
     - *Business Rules*: Rich textarea for capturing business constraints, access levels, and edge cases.
   - Clicking **Save API** persists the data locally, provides instant UI feedback, and redirects to the newly created endpoint.

5. **Multi-Format Export**:
   - Clicking **Export all APIs** in the top bar reveals a clean dropdown with the 4 export choices.
   - Selecting any option immediately downloads the generated file to the user's machine (`openapi.json`, `postman_collection.json`, `API_DOCS.md`, or `apibench_backup.json`).

---

### Visual Identity & Theme: "The Warm Workshop"

| Role | Color Name | Hex Code | Visual Application |
| :--- | :--- | :--- | :--- |
| **Canvas** | Oat Milk / Warm Sand | `#F7F5F0` | Main application background (glare-free) |
| **Surface** | Warm Bone | `#FFFFFF` | Cards, panels, modal dialogs |
| **Sidebar** | River Pebble | `#EFECE6` | Left navigation background |
| **Borders** | Pressed Linen | `#E3DDD3` | Hairline dividers and table borders |
| **Text Primary** | Deep Espresso | `#292524` | Headings, route paths, primary text |
| **Text Muted** | Warm Bark | `#78716C` | Metadata, descriptions, timestamps |
| **Primary Brand** | Terracotta Clay | `#C26D53` | Primary action button (`+ ADD NEW API`), active tabs |
| **Primary Hover** | Deep Rust | `#A8543B` | Button hover state |
| **GET Badge** | Muted Sage | `#E5EFE7` bg / `#265937` text | Safe read operations |
| **POST Badge** | Weathered Denim | `#E5EEF7` bg / `#2B577A` text | Creation operations |
| **PUT/PATCH Badge**| Baked Ochre | `#FAF0DF` bg / `#7C5318` text | Mutation operations |
| **DELETE Badge** | Faded Terracotta | `#F9E7E4` bg / `#8A372E` text | Removal operations |

**Typography**:
- Brand & Display Headings: Clean, modern sans (`Plus Jakarta Sans` / system geometric).
- Body & Form Controls: Natural readable sans (`DM Sans` / clean system UI).
- Code, Paths & Tabular Metrics: High-legibility monospace with tabular figures (`JetBrains Mono` / `ui-monospace`, `tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: SVG-Powered High-Fidelity Custom Charts vs. Heavy External Chart Library**
  - *Chosen Approach*: Implement tailored React SVG components for the Donut/Pie Chart and Horizontal Bar Chart using exact design tokens and responsive containers.
  - *Why*: Eliminates React 19 compatibility hurdles with legacy chart wrappers, ensures sub-millisecond rendering with zero layout jitter, and gives 100% control over pastel earth color fills, hover tooltips, and slice animations.
  - *Alternatives Considered*: Recharts was evaluated, but native SVG components avoid dependency bloat and guarantee flawless pastel earth styling.

- **Decision 2: Local Storage Engine with Modular File Import/Export**
  - *Chosen Approach*: An intelligent dual-layer storage engine: active state persists in browser storage across restarts and browser refreshes, with instant export to modular JSON structures, OpenAPI, and Postman formats. A "Reset to Sample Data" button allows quick restore.
  - *Why*: Allows the app to function immediately both in the AI Studio cloud sandbox and directly in a cloned local Git repository without requiring local filesystem permissions or external daemon processes.

- **Decision 3: First-Class Markdown Rendering for Business Rules**
  - *Chosen Approach*: Parse and render business rules with clean structured formatting (bullet lists, code chips, bold notes) rather than plain unstyled text.
  - *Why*: Business rules are the most critical differentiating feature of APIBench; making them readable and structured bridges developer specs with product and QA requirements.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        APIBench Web Application                        │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Fixed Left Sidebar   │  │              Main Canvas              │  │
│  │  - Brand Wordmark     │  │  Top Bar: Title · [+ Add API] · [Export]│
│  │  - [Dashboard] Tab    │  ├───────────────────────────────────────┤  │
│  │  - [APIs] Tab         │  │              Active View              │  │
│  │  - Storage Status     │  │  ┌─────────────────────────────────┐  │  │
│  └───────────────────────┘  │  │ 1. Dashboard View (Stats Cards) │  │  │
│                             │  │    - Total Count Card           │  │  │
│                             │  │    - HTTP Methods Donut Chart   │  │  │
│                             │  │    - Service Bar Chart          │  │  │
│                             │  │    - Recent Endpoints Activity  │  │  │
│                             │  │                                 │  │  │
│                             │  │ 2. APIs Catalog Table View      │  │  │
│                             │  │    - Search & Method Filter Bar │  │  │
│                             │  │    - Interactive Route Rows     │  │  │
│                             │  │                                 │  │  │
│                             │  │ 3. API Details Screen           │  │  │
│                             │  │    - Copy cURL & Shell Preview  │  │  │
│                             │  │    - Formatted Business Rules   │  │  │
│                             │  │    - Multi-Response Viewer      │  │  │
│                             │  │    - Edit & Delete Triggers     │  │  │
│                             │  │                                 │  │  │
│                             │  │ 4. Add / Edit API Form Screen   │  │  │
│                             │  │    - Route & Controller Inputs  │  │  │
│                             │  │    - Headers & Params Tables    │  │  │
│                             │  │    - Multi-Response Builder     │  │  │
│                             │  │    - Business Rules Markdown    │  │  │
│                             │  └─────────────────────────────────┘  │  │
│                             └───────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │             Local Storage & Exporter Engine            │
        │  - Local Data Store (Seeds Auth, Users, Billing)       │
        │  - cURL Command Generator                              │
        │  - OpenAPI 3.1.0 Serializer                            │
        │  - Postman Collection v2.1.0 Serializer                │
        │  - Markdown & Raw JSON Generator                       │
        └────────────────────────────────────────────────────────┘
```

### Data Entity Model

```typescript
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface ApiResponseDef {
  id: string;
  statusCode: number;
  statusText: string;
  description: string;
  headers?: KeyValueItem[];
  body: string; // JSON formatted example
}

export interface ApiEndpoint {
  id: string;
  title: string;
  service: string; // Controller or microservice name
  path: string;
  method: HttpMethod;
  summary: string;
  businessRules: string; // Markdown/structured business logic
  headers: KeyValueItem[];
  pathParams: KeyValueItem[];
  queryParams: KeyValueItem[];
  requestBody: {
    contentType: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'none';
    rawBody: string;
  };
  responses: ApiResponseDef[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Implementation Sequence

1. **Step 1: Application Shell & Theme Tokens**
   - Update `metadata.json` and `index.html` with official name "APIBench" and meta descriptions.
   - Configure Tailwind color palette and semantic tokens in `src/index.css` for Warm Sand, Espresso, Terracotta, Sage, Denim, Ochre, and Linen.
2. **Step 2: Core Data Engine & Exporters**
   - Implement `src/types/api.ts` with comprehensive interfaces.
   - Implement `src/lib/storage.ts` with auto-seeding sample APIs (`AuthController`, `UserController`, `BillingController`).
   - Implement `src/lib/curl.ts` for bash-ready cURL command construction.
   - Implement `src/lib/exporters.ts` for OpenAPI 3.1, Postman v2.1, Markdown documentation, and JSON backups.
3. **Step 3: Navigation & Dashboard View**
   - Build the fixed left navigation bar with **Dashboard** and **APIs** tabs.
   - Build the 3 stats cards: Total Endpoints counter, HTTP Methods Donut Chart, and Controller Horizontal Bar Chart.
   - Wire the top action buttons: `+ ADD NEW API` and the multi-format `Export all APIs` dropdown.
4. **Step 4: APIs Directory & Tabular View**
   - Build the searchable, filterable APIs table with live search and method filter buttons.
   - Add empty states and quick actions.
5. **Step 5: API Details Screen**
   - Build the inspection screen with route details, copy cURL command with copy feedback, business rules container, and status-code tabbed response body viewer.
   - Wire Edit and Delete buttons.
6. **Step 6: Add / Edit API Form**
   - Build the comprehensive, effortless API form editor supporting dynamic key-value rows for headers, query params, path variables, request bodies, and multiple response status cards.
   - Connect save validation and redirect back to the created/updated API.
7. **Step 7: Verification & Build**
   - Test all user flows, check compilation via `compile_applet`, and verify responsive layout.
