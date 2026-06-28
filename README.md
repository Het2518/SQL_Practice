# Engineer Hub: Intelligence Platform (SQL Practice Environment)

A professional, production-grade SQL practice platform built specifically for software engineering candidates preparing for placement drives. 

This platform allows users to solve complex, real-world database queries directly in the browser without any backend server overhead. It utilizes **WebAssembly (sql.js)** to spin up a fully isolated SQLite instance locally for every user session.

## 🚀 Key Features

### Core Execution Engine
* **In-Browser SQLite Runtime**: Executes complex queries (JOINs, Window Functions, CTEs) instantly in the browser with zero latency.
* **10+ Complex Datasets**: Practice on highly-normalized, realistic schemas including Airlines, Banking, E-commerce, Hospital, University, and more.
* **Schema-Aware IntelliSense**: The built-in Monaco Editor automatically detects the active database and provides smart autocomplete suggestions for exact table and column names.

### Premium Portfolio Features
* **Query Execution Plan (EXPLAIN)**: Visualize exactly how the SQL engine parses and executes your queries (e.g., Table Scans vs Index Seeks) to practice query optimization.
* **Interactive ER Diagrams**: Dynamically rendered Entity-Relationship diagrams for every database with Pan, Zoom, and SVG Download capabilities.
* **Query History**: Automatically remembers the last 50 queries executed across sessions, allowing you to easily retrieve and re-run complex snippets.
* **Table Data Previews**: Inspect sample data from any table before writing your queries.

### Gamification & Tracking
* **Cloud Progress Sync**: Seamless integration with **Supabase** for secure authentication and real-time syncing of your completed questions.
* **Rich Profile Dashboard**: A professional analytics dashboard featuring an activity heatmap (GitHub style), skill progression rings, and completion statistics.
* **Hint & Solution System**: Step-by-step hints and full solution reveals for when you get stuck on advanced problems.
* **Sandbox Mode**: A safe playground to freely write `INSERT`, `UPDATE`, or `DELETE` statements without breaking the app (includes a 1-click **Reset DB** feature).

### Architecture & Design
* **React Router Dom**: Fully implemented client-side routing with protected routes for authenticated-only access (`/practice`, `/profile`).
* **Premium Design System**: A meticulously crafted "Earthy" theme (with full Dark Mode support) built from scratch without bloated CSS frameworks.

## 🛠 Tech Stack
* **Frontend:** React, Vite, React Router, Vanilla CSS (Custom Design System)
* **Code Editor:** Monaco Editor (VS Code internal engine)
* **Database Engine:** sql.js (WebAssembly SQLite port)
* **Authentication & Backend:** Supabase (PostgreSQL, Auth, RLS Policies)
* **Visualizations:** Mermaid.js (ER Diagrams), react-zoom-pan-pinch

## 💻 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Het2518/Engineer-Hub-Intelligence-Platform.git
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

5. **Open your browser:**
   Navigate to `http://localhost:5173` to start practicing!
