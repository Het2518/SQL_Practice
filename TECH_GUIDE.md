# Technical Guide & Architecture Overview

Welcome to the **Engineer Hub Intelligence Platform** technical guide. This document provides a deep dive into the technology stack, application architecture, data flow, and core features of the platform. It is designed to help developers, contributors, and technical reviewers understand exactly how the application functions under the hood.

---

## 1. What is the Project?

The **Engineer Hub Intelligence Platform** is a highly interactive, production-grade SQL practice environment. It is built specifically for software engineering candidates preparing for technical interviews and placement drives. 

Unlike traditional SQL platforms that rely on heavy backend servers to execute user queries, this platform brings the entire database engine **directly into the browser**. This allows for zero-latency query execution, offline capabilities, and a completely private practice environment.

---

## 2. Technology Stack

The application is built using a modern, highly optimized **Frontend-Only Architecture** combined with a cloud database for persistent state.

### Core Frameworks & Build Tools
* **React 19**: The core UI library used for building the component-based user interface.
* **Vite 8**: The ultra-fast build tool and bundler. It handles HMR during development and performs aggressive chunk splitting and minification for production.
* **React Router v7**: Handles client-side routing, enabling a seamless Single Page Application (SPA) experience without page reloads.

### Database Execution Engine (The Core)
* **sql.js**: A WebAssembly (WASM) port of SQLite. This is the engine that compiles and runs SQL queries natively within the browser environment.
* **Web Workers API**: The SQLite execution engine is completely offloaded to a background Web Worker (`sql.worker.js`). This prevents heavy SQL computations from blocking the main React thread, ensuring the UI remains smooth (60fps).

### Editor & Visualization
* **Monaco Editor (`@monaco-editor/react`)**: The exact same code editor that powers VS Code. It provides syntax highlighting, intelligent autocomplete (IntelliSense), and error validation.
* **Mermaid.js**: Used dynamically within the Schema Viewer to render visual Entity-Relationship (ER) diagrams of the databases.
* **React Zoom Pan Pinch**: Provides the interactive, map-like controls for navigating the complex ER diagrams.
* **Canvas Confetti**: For gamified, visual feedback when a user solves a difficult problem.

### Authentication & Cloud Sync
* **Supabase**: Serves as the Backend-as-a-Service (BaaS). It provides secure user authentication (Email/Password) and PostgreSQL storage to sync user progress, achievements, and statistics across devices.

---

## 3. Application Architecture & Micro-Modules

The application adheres to a highly decoupled **Micro-Frontend/Module Architecture**. 

Instead of serving one massive bundle of JavaScript, the application is divided into lazy-loaded micro-modules:
1. **Core Shell**: The minimal application shell containing routing logic and authentication state.
2. **Feature Modules**: Heavy components like the `ProfileView`, `UserGuide`, and `InterviewDashboard` are dynamically loaded using `React.lazy()` only when the user navigates to them.
3. **Vendor Segregation**: Vite's `manualChunks` is configured to split heavy dependencies (`monaco`, `sql.js`, `react` core) into highly cacheable vendor files.

### The Caching Layer
To ensure "Beast-Mode" performance, the Web Worker implements a **Least Recently Used (LRU) Cache**. If a user or the system runs the exact same query twice (e.g., verifying an answer), the result is served instantly from memory (0ms) rather than recompiling the SQL.

---

## 4. Application Flow & How It Works

### Step 1: Bootstrapping & Auth
When a user accesses the site, the minimal React Shell loads. The `useAuth` hook checks for an active Supabase session. 
- If authenticated, Supabase syncs their historical progress (`completed_questions`) down to the client.
- If not, they are prompted via the `AuthModal` to sign in.

### Step 2: Database Initialization
When a user selects a database (e.g., "Airlines" or "Banking"):
1. The React app sends a `load-db` message to the Web Worker.
2. The Web Worker fetches the initialization `.sql` schema from `src/data/schemas.js`.
3. The Web Worker uses `sql.js` (WebAssembly) to execute the schema and build a fully functional, in-memory SQLite database.
4. The worker signals success back to React.

### Step 3: Query Execution Loop
1. The user types a query into the Monaco Editor.
2. Upon clicking "Run", React sends the raw SQL string to the Web Worker.
3. The Worker executes the query against the in-memory SQLite instance.
4. The Worker intercepts the results and formats them into an array of objects (columns and rows).
5. The data is posted back to the React UI, which renders the resulting Table.

### Step 4: Verification & Gamification
1. When a user runs a query to solve a problem, the system automatically runs the *hidden correct solution* in the background.
2. It performs a deep comparison between the user's result set and the correct result set.
3. If they match, the system triggers the "Success" flow: confetti fires, the problem is marked as solved, and `useGamification` updates their XP, Rank, and Streak.
4. A debounced API call synchronizes this new state up to the Supabase Cloud.

---

## 5. Core Features Outline

- **Browser-Native SQL Engine**: No backend latency; write and execute SQL instantly.
- **Context-Aware IntelliSense**: The editor knows exactly which tables and columns exist in the active database and provides precise autocomplete suggestions.
- **Execution Plans (EXPLAIN)**: A tool for advanced users to view exactly how SQLite is scanning tables and utilizing indexes under the hood.
- **Interactive Schema Viewer**: Auto-generated ER diagrams for every dataset that can be panned, zoomed, and studied.
- **Progress Synchronization**: Complete a problem on your laptop, and your progress is instantly updated on your desktop via Supabase.
- **Analytics Dashboard**: A highly polished, solid-UI Profile view tracking global rank, daily heatmaps, topic mastery bars, and badge achievements.
- **Dynamic Theming**: Instant Light/Dark mode toggling driven by CSS variables.
- **Sandbox Environment**: Because the database lives in memory, users can run destructive queries (`DROP TABLE`, `DELETE`) without consequence. A "Reset DB" button simply re-initializes the schema.

---

*This platform represents a fusion of modern web technologies, combining the performance of WebAssembly, the concurrency of Web Workers, and the reactive power of React to deliver a flawless educational experience.*
