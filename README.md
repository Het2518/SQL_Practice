# DataDesk (SQL Practice Environment)

A professional, production-grade SQL practice platform built specifically for software engineering candidates preparing for placement drives. 

This platform allows users to solve complex, real-world database queries directly in the browser without any backend server overhead. It utilizes **WebAssembly (sql.js)** combined with **Web Workers** to spin up a fully isolated, lightning-fast SQLite instance locally for every user session.

## 🚀 Key Features

### Beast-Mode Performance Architecture
* **Non-Blocking Web Worker**: Database initializations and heavy SQL computations are offloaded to a dedicated background Web Worker, ensuring the React UI remains buttery smooth at 60fps even during complex JOINs.
* **LRU Query Caching Layer**: A custom Least Recently Used (LRU) caching mechanism instantly serves identical queries in 0ms, drastically reducing redundant computations.
* **Micro-Frontend Module Splitting**: The monolithic frontend is dynamically code-split using React `lazy` and `Suspense`. Heavy components (Monaco Editor, Schema Viewer, Profile Dashboard) are lazily loaded on demand.
* **Aggressive Vendor Chunking**: Vite is configured to isolate heavy dependencies (`monaco`, `sql.js`, `react`) into highly cacheable, parallel-loaded chunks for instantaneous production deployments.

### Core Execution Engine
* **In-Browser SQLite Runtime**: Executes complex queries (JOINs, Window Functions, CTEs) instantly in the browser.
* **10+ Complex Datasets**: Practice on highly-normalized, realistic schemas including Airlines, Banking, E-commerce, Hospital, University, and more.
* **Schema-Aware IntelliSense**: The built-in Monaco Editor automatically detects the active database and provides smart autocomplete suggestions for exact table and column names.

### Premium Portfolio Features
* **Query Execution Plan (EXPLAIN)**: Visualize exactly how the SQL engine parses and executes your queries (e.g., Table Scans vs Index Seeks) to practice query optimization.
* **Interactive ER Diagrams**: Dynamically rendered Entity-Relationship diagrams for every database with smooth Pan, Zoom, and interactive constraints.
* **Query History**: Automatically remembers the last 50 queries executed across sessions, allowing you to easily retrieve and re-run complex snippets.
* **Table Data Previews**: Inspect sample data from any table before writing your queries.

### Gamification & Tracking
* **Cloud Progress Sync**: Seamless integration with **Supabase** for secure authentication and real-time syncing of your completed questions.
* **Rich Profile Dashboard**: A professional analytics dashboard featuring an activity heatmap (GitHub style), skill progression rings, quest tracking, and completion statistics built with an ultra-clean solid UI design.
* **Hint & Solution System**: Step-by-step hints and full solution reveals for when you get stuck on advanced problems.
* **Sandbox Mode**: A safe playground to freely write `INSERT`, `UPDATE`, or `DELETE` statements without breaking the app (includes a 1-click **Reset DB** feature).

### Architecture & Design
* **React Router Dom**: Fully implemented client-side routing with protected routes for authenticated-only access (`/practice`, `/profile`, `/guide`).
* **Premium Design System**: A meticulously crafted minimalist theme (with full Dark Mode support) built from scratch using clean vanilla CSS variables.
* **Isolated Data Layers**: Database initialization definitions and schemas are decoupled from the UI layer for optimal bundle sizes.

## 🛠 Tech Stack
* **Frontend:** React 19, Vite 8, React Router, Vanilla CSS (Custom Design System)
* **Code Editor:** Monaco Editor (VS Code internal engine)
* **Database Engine:** sql.js (WebAssembly SQLite port) via Dedicated Web Worker
* **Authentication & Backend:** Supabase (PostgreSQL, Auth, RLS Policies)
* **Visualizations:** Mermaid.js (ER Diagrams), react-zoom-pan-pinch

## 💻 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Het2518/DataDesk.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: Ensure the `user_progress` table is created in your Supabase SQL editor using the provided schema script.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Deploy to Production (Vercel/Netlify):**
   The `npm run build` output is fully optimized with manual chunk splitting and asset preloading. No extra configuration is needed for static hosting!
