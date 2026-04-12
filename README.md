# ☕ CogniBrew

**AI-Powered Barista Dashboard — Know your customer before they reach the counter.**

CogniBrew is a near real-time customer recognition system built for the café industry. It eliminates "late-stage identification" by shifting customer recognition from checkout to the moment they walk through the door, giving baristas actionable insights—name, usual order, and an intelligent upsell prompt—before the first word is spoken.

---

## ✨ Key Features

| Feature | Description |
| --- | --- |
| **AI Insights Panel** | Real-time facial recognition feed with customer profiles, usual orders, upsell suggestions, and AI-generated greeting scripts |
| **Smart POS Register** | Full menu browsing with category navigation, item customization (sweetness, milk, bean type), and cart management |
| **Human-in-the-Loop Feedback** | Barista taps ("Usual Order", "Wrong Person", "Skip") silently generate ground-truth labels to retrain the edge model |
| **Graceful Degradation** | The POS always works—if the AI goes down, the right-side panels operate independently as a standard manual register |
| **Customer Queue** | Animated queue showing up to 4 detected customers with focus-switching, powered by Framer Motion |
| **Membership Lookup** | Phone-based membership linking for guest customers |
| **Order Management** | Dine-in / To-go toggle, quantity controls, item customization modal, and checkout submission |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CogniBrew Dashboard                         │
│                                                                     │
│  ┌──────────┐  ┌────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Sidebar  │  │  AI Insights   │  │     Menu     │  │   Order   │  │
│  │          │  │                │  │              │  │           │  │
│  │ Register │  │ Face Detection │  │  Categories  │  │ Cart      │  │
│  │ History  │  │ Customer Card  │  │  Item Grid   │  │ Totals    │  │
│  │ Kitchen  │  │ Usual Order    │  │              │  │ Checkout  │  │
│  │ Customer │  │ Upsell         │  │              │  │           │  │
│  │ Settings │  │ Greeting       │  │              │  │           │  │
│  │ Logout   │  │ Queue          │  │              │  │           │  │
│  └──────────┘  └────────────────┘  └──────────────┘  └───────────┘  │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API
                   ┌─────────▼──────────┐
                   │  Express Proxy     │
                   │  (server.ts:3002)  │
                   └─────────┬──────────┘
                             │
                   ┌─────────▼──────────┐
                   │   Edge ML Server   │
                   │   (or Mock Data)   │
                   └────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend** — React 19, TypeScript, Vite
- **Styling** — Tailwind CSS v4
- **Animations** — Motion (Framer Motion)
- **Routing** — React Router v7
- **Icons** — Material Symbols + Lucide React
- **Backend Proxy** — Express + CORS
- **Real-time WS** — SignalR

---

## 📁 Project Structure

```
cognibrew-ui/
├── src/
│   ├── components/
│   │   ├── AiInsightsPanel.tsx   # AI facial recognition & customer insights
│   │   ├── MenuPanel.tsx         # Category grid & item selection
│   │   ├── OrderPanel.tsx        # Cart, totals & checkout
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── CustomizeModal.tsx    # Item modifier modal (sweetness, milk, beans)
│   │   └── MembershipModal.tsx   # Phone-based membership lookup
│   ├── pages/
│   │   ├── dashboard.tsx         # Main POS dashboard (orchestrator)
│   │   ├── login.tsx             # Authentication page
│   │   └── signup.tsx            # Registration page
│   ├── hooks/
│   │   └── useDashboardData.ts   # Data fetching hook (menu, config, popular)
│   ├── services/
│   │   └── api.ts                # API client (detect, menu, order, feedback)
│   ├── server.ts                 # Express proxy with mock data
│   ├── types.ts                  # Shared TypeScript types
│   ├── App.tsx                   # Router & auth state
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles & design tokens
├── ai-dev/                       # Internal AI development docs
├── .env.example                  # Environment variable template
├── vite.config.ts                # Vite + Tailwind + React config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/golfgap16278/cognibrew-ui.git
cd cognibrew-ui

# Install dependencies
npm install
```

### Running the App

You need **two terminals** — one for the mock backend, one for the frontend:

```bash
# Terminal 1 — Start the Express proxy server (port 3002)
npx tsx src/server.ts

# Terminal 2 — Start the Vite dev server (port 3000)
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Note:** The app ships with a built-in mock server that simulates the edge ML pipeline, so no external AI hardware is required for development.

---

## 🎯 Design Principles

1. **Zero-Friction Fallback** — The ML system is advisory. If AI fails or the network drops, the POS degrades gracefully to a standard manual register. The right-side panels always work independently.

2. **Human-in-the-Loop** — Every barista interaction ("Usual Order", "Skip", "Wrong Person") generates ground-truth labels that are sent as feedback to retrain the edge model—without the barista realizing they're labeling data.

3. **Speed is Paramount** — The full pipeline (detection → UI render) targets < 1.5s latency. The UI is designed to feel instantaneous and touch-friendly for high-volume café environments.

---

## 📡 API Endpoints

The Express proxy (`server.ts`) exposes the following endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/detect` | Poll for face detection results (returns a customer profile) |
| `GET` | `/api/config` | Fetch config (sweetness levels, milk types, bean types, customers) |
| `GET` | `/api/menu` | Fetch menu items and categories |
| `GET` | `/api/popular` | Fetch trending/popular items for guest recommendations |
| `POST` | `/api/order` | Submit a completed order |
| `POST` | `/api/feedback` | Submit human-in-the-loop feedback labels |

---

## 🧪 Available Scripts

```bash
npm run dev        # Start Vite dev server on port 3000
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Type-check with TypeScript (tsc --noEmit)
npm run clean      # Remove dist/ directory
```

---

## 📄 License

This project is for educational and demonstration purposes.
