# TruthLens: AI-Powered Fact Verification Platform

**TruthLens** is a full-stack application that allows users to verify news headlines or articles instantly. It combines a modern React frontend with a robust Node.js/Express backend that utilizes the Perplexity AI SDK for deep evidence gathering and analysis.

## 🚀 Key Features

* **Multilingual Fact-Checking**: Supports claims written in English, Hindi, and Marathi.
* **Real-Time AI Analysis**: Uses Perplexity AI (`sonar-pro`) to cross-reference claims against public knowledge and current web data.
* **Intelligent Caching**: Features a MySQL-backed semantic cache that uses string similarity (85% threshold) to return instant results for previously checked claims, reducing API costs and latency.
* **Source Enrichment & Summarization**: Automatically scrapes evidence URLs using Cheerio and uses AI to generate concise 2–3 sentence summaries of how each source relates to the claim.
* **Confidence Scoring**: Provides a verdict (True, False, Mixed, or Uncertain) accompanied by a confidence percentage.
* **Browser Integration**: Includes a dedicated page for a Firefox Extension that allows users to fact-check text directly from their browser context menu.
* **Animated Detection UI**: A multi-step analysis visualization that guides the user through processing, evidence fetching, and final verdict delivery.

## 🛠️ Technical Architecture

### Frontend (React + Vite)

* **Routing**: Managed via `react-router-dom` with routes for the Homepage, Detection Page, and Extension Page.
* **Animations**: Extensive use of `framer-motion` for smooth page transitions, hover effects, and the results loading sequence.
* **State Management**: Uses React hooks (`useState`, `useRef`) to manage analysis status and background processing timers.
* **Icons**: Integrated using `lucide-react` for a clean, modern interface.

### Backend (Node.js + Express)

* **AI Integration**: Powered by `@ai-sdk/perplexity` to perform complex reasoning and search-based verification.
* **Database**: MySQL connection pool with an automated keep-alive mechanism and periodic cache cleanup (3-minute TTL) to maintain performance.
* **Web Scraping**: `cheerio` and `node-fetch` are used to extract raw text from news articles for background summary generation.
* **Timezone Sync**: Enforces Indian Standard Time (IST) for all database entries and logs.

## 📂 Project Structure

```text
├── backend/
│   └── server.js           # Core API logic, AI prompts, and DB management
├── src/
│   ├── components/         # UI elements like VerdictBadge, Navbar, and Footer
│   ├── data/
│   │   └── trustedSources.js # Curated list of verified news organizations
│   ├── pages/
│   │   ├── HomePage.jsx    # Landing page with "How it works"
│   │   └── DetectionPage.jsx # Main analysis interface
│   └── App.jsx             # Main application entry and routing
├── public/icons/           # Custom SVG/PNG assets for branding and steps
└── package.json            # Project dependencies and metadata

```

## 🚥 Getting Started

### Backend Setup

1. Navigate to the `/backend` directory.
2. Install dependencies: `npm install`.
3. Configure your `.env` file with `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, and `PERPLEXITY_API_KEY`.
4. Start the server: `node server.js`.

### Frontend Setup

1. Navigate to the root directory.
2. Install dependencies: `npm install`.
3. Configure `VITE_API_BASE_URL` in your environment variables to point to your backend.
4. Start the development server: `npm run dev`.

## 🛡️ Trusted Sources

The platform cross-references claims with a curated list of global and regional leaders in journalism, including:

* **Global**: BBC News, Reuters, Associated Press, The New York Times.
* **Regional (India)**: The Hindu, NDTV, India Today, Hindustan Times.
* **Fact-Checkers**: FactCheck.org.
