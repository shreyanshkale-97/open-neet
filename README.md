# 🎯 AIM NEET AI Platform

[![Nx Monorepo](https://img.shields.io/badge/Nx-Monorepo-blue?style=flat&logo=nx)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?style=flat&logo=nestjs)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)

An intelligent, AI-powered diagnostic assessment, test generation, and question paper parsing platform specifically engineered for **NEET (National Eligibility cum Entrance Test)** preparation across Physics, Chemistry, and Biology.

---

## 🌟 Key Features

### 📄 1. Intelligent PDF Paper Extraction Engine (Factory Pipeline v2.0)
Extracts questions, options, correct answers, subject tags, and diagram crops from official NEET papers, DPPs, and scanned sheets with high precision:
- **Multi-Layout Support**: Handles 56-page NTA official booklets, 2-column DPP sheets (Physics Wallah, Allen, Aakash), and scanned image PDFs.
- **2D Column-Aware Sorting**: Precise $Y$-descending (top-to-bottom) and $X$-ascending (left-to-right) line reader prevents text item scrambling in two-column exam layouts.
- **Instruction Page Suppressor**: Automatically detects and skips Page 1 cover instructions so extraction begins cleanly on actual questions.
- **High-DPI Diagram Renderer**: Renders question diagrams at 2.5x resolution with $+80\text{px}$ slice height padding and surgical line erasers for crisp circuit/graph images without truncation.
- **NEET Scientific Symbol Normalizer**: Full normalization for Greek symbols ($\pi, \alpha, \beta, \gamma, \mu, \Omega, \theta$), fractions ($\frac{1}{2}, \frac{1}{4}$), units ($\text{\AA}, \text{°C}$), and chemical reaction arrows ($\rightarrow, \rightleftharpoons$).
- **Multi-Strategy Option Parser**: Eliminates generic `"Option A"` placeholders using 4 sequential fallback strategies for `(1)`, `(a)`, `A.`, `A)`, and `[1]`.
- **Vision OCR Fallback**: Automatically invokes Tesseract.js worker engine when processing scanned or photo-based PDF documents.

### 🧪 2. Test Generation & Live Exam Engine
- **Custom Test Creation**: Generate timed mock exams filtered by Subject (Physics, Chemistry, Botany, Zoology), Chapter, Question Count, and Difficulty.
- **Interactive Exam UI**: Complete test interface with live timer, question palette navigation, status color indicators (Answered, Unanswered, Marked for Review), and instant submission.
- **Performance Analytics**: Instant score calculation, detailed subject-wise breakdown, and target score comparison.

---

## 🏗️ Architecture & Project Structure

The project is structured as an **Nx Monorepo**:

```
neet-ai-platform/
├── apps/
│   ├── api/                 # NestJS Backend API Service
│   │   └── src/
│   │       ├── ai/          # AI Pipeline v2.0 (Stages, Providers, RAG, Service)
│   │       │   ├── factory/ # Factory Pipeline Stage Executor
│   │       │   ├── pipeline/# Extraction Stages (Splitter, Builder, Vision OCR)
│   │       │   ├── providers/# LLM Adapters (Gemini, Ollama)
│   │       │   ├── rag/     # Vector Retrieval & Question Store
│   │       │   └── services/# PDF Processor & Canvas Renderer
│   │       ├── assessment/  # Test & Question Management
│   │       ├── core/        # User Authentication & Profiles
│   │       └── infrastructure/# Config, Database, Redis, Logger
│   │
│   ├── frontend/            # React 18 + Vite Web Application
│   │   └── src/
│   │       ├── pages/       # Dashboard, Own Paper Mode, AI Generator, Test UI
│   │       ├── services/    # Axios API Client & State Hooks
│   │       └── styles.css   # Dark / Light Theme Tokens & Palette Styles
│   │
│   └── worker/              # NestJS Async Background Worker
│
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `pnpm` or `npm`
- **Database**: PostgreSQL (v14+)
- **Cache / Queue**: Redis (v7+)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/shreyanshkale-97/open-neet.git
cd neet-ai-platform
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neet_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Running Services Locally

#### Start Backend API:
```bash
pnpm exec nx serve api
```

#### Start Frontend Web App:
```bash
pnpm exec nx serve frontend
```

#### Start Background Worker:
```bash
pnpm exec nx serve worker
```

The application will be accessible at:
- **Frontend App**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000/api/v1`
- **API Health Check**: `http://localhost:3000/api/v1/health`

---

## 🛠️ Testing & Verification

Run automated tests for the workspace:
```bash
# Run unit tests across all applications
pnpm exec nx run-many -t test

# Build all applications for production
pnpm exec nx run-many -t build
```

---

## 🐳 Docker Deployment

Build and run using Docker Compose:
```bash
docker-compose up --build -d
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
