# 🎓 AI Student Success Agent

> **An Agentic AI System for Personalized Academic Planning and Placement Preparation**

A working full-stack MVP demonstrating genuine **multi-agent AI orchestration with LangGraph** rather than a standard static chatbot. Features dynamic study schedule replanning, priority-based assignment rescheduling, gamified streak/XP rewards, and a 4-week placement preparation roadmap.

---

## 🌟 Key Features & Multi-Agent Architecture

The application uses **3 specialized AI Agents** orchestrated via a **LangGraph StateGraph**:

```
                              ┌────────────────────────┐
                              │    Student Request     │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │   Coordinator Agent    │ (Router & Intent Classifier)
                              └───────────┬────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
     ┌───────────────────────────┐                 ┌───────────────────────────┐
     │    Study & Task Agent     │                 │      Placement Agent      │
     └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │  PostgreSQL Database   │ (Schedules, Items & Diffs)
                              └────────────────────────┘
```

### 1. 🧭 Coordinator Agent
* Central orchestrator & intent classifier.
* Routes student queries to either **Study & Task Agent** or **Placement Agent**.
* Merges structured outputs and provides final synthesized explanations.

### 2. 📅 Study & Task Agent
* Manages academic tasks, deadlines, priorities, and study hours.
* **⚡ DYNAMIC REPLANNING (Main Feature)**:
  * When a high-priority assignment is added (e.g. *DBMS assignment due tomorrow*), the agent automatically recalculates study time slots.
  * Displaces routine study tasks (e.g. shifts *DSA Practice* from 5 PM to 8:30 PM) to prioritize urgent deadlines.
  * Generates visual diff markers (`added`, `moved`, `unchanged`) in PostgreSQL and provides AI explanation for *"Why was my schedule changed?"*.

### 3. 🎯 Placement Agent
* Generates a 4-week structured placement preparation roadmap across **DSA**, **Core CS**, **Aptitude**, and **Interview & Resume** prep.
* Tracks topic statuses (`Not Started`, `In Progress`, `Completed`) and dynamically updates overall readiness percentage.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, React Router v6, Axios, Lucide React
* **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, Python-JOSE (JWT)
* **Database**: PostgreSQL (or SQLite local fallback)
* **AI Orchestration**: LangGraph, LangChain, Google Gemini / OpenAI SDKs

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* PostgreSQL (Optional: SQLite auto-config runs out of the box)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment & install dependencies**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` or create `backend/.env`:
   ```env
   SECRET_KEY="super-secret-jwt-key-2026"
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_student_planner"
   GEMINI_API_KEY="your-gemini-api-key"
   ```
   *(Note: If PostgreSQL is not installed locally, use `DATABASE_URL="sqlite:///./ai_student_planner.db"`)*

4. **Start FastAPI Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start React Vite Dev Server**:
   ```bash
   npm run dev
   ```
   App available at: `http://localhost:5173`

---

## 🎬 How to Run the Dynamic Replanning Demo

Follow these steps to experience the Agentic AI dynamic schedule replanning:

1. **Register & Onboard**:
   * Open `http://localhost:5173/register` and create an account.
   * Complete onboarding specifying your preferred study time (e.g. *Evening*).

2. **View Baseline Schedule**:
   * Navigate to **AI Planner** (`/planner`).
   * Observe the default evening schedule (e.g., 5:00 PM → DSA, 7:30 PM → OS, 9:00 PM → DBMS).

3. **Trigger Urgent Task Addition**:
   * Navigate to **Tasks** (`/tasks`) and click **"Add Task / Assignment"**.
   * Title: `DBMS Assignment due tomorrow`
   * Subject: `DBMS`
   * Priority: `High Priority 🔥`
   * Checkbox: `Trigger Dynamic Replanning (Study & Task Agent)` checked.
   * Click **Create Task**.

4. **Observe Dynamic Replanning in Real Time**:
   * The application invokes `Study & Task Agent` via `LangGraph`.
   * Open **AI Planner** (`/planner`).
   * **Visual Diff Highlights**:
     * 🟢 **Added**: `DBMS Assignment due tomorrow` inserted at 5:00 PM (Prime slot).
     * 🟡 **Moved**: `DSA Practice` automatically shifted to 8:30 PM.
     * 🔵 **Unchanged**: `OS Revision` kept at 7:30 PM.
   * Click **"Why was my schedule changed?"** to view the AI Agent's step-by-step reasoning modal!

5. **Interact via AI Chat Agent**:
   * Go to **AI Chat** (`/chat`).
   * Type: `"I have an urgent DSA assignment due tomorrow."`
   * Watch the Coordinator Agent route the prompt to the Study & Task Agent and auto-replan PostgreSQL schedule items directly within chat!

---

## 📊 Database Schema Summary

* `users`: Auth credentials, XP, daily streak counter
* `student_profiles`: Branch, semester, available hours, preferred time, target role
* `subjects`: Academic course definitions with priorities and color codes
* `tasks`: Task title, deadline, estimated duration, priority, status, XP reward
* `schedules`: Date, summary, AI replan explanation text
* `schedule_items`: Start/end times, status, `change_type` (`added`, `moved`, `unchanged`), original slot
* `placement_goals`: Target role, company, 4-week timeline, readiness percentage
* `placement_topics`: DSA, Core CS, Aptitude, Interview topics with week numbers & statuses

---

## 📄 License
MIT License
