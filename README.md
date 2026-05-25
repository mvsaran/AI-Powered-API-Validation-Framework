# 🧬 AI-Powered API Validation Framework

> **Enterprise-grade pharmacy adjudication testing** — combining the speed of **Playwright (TypeScript)** with the cognitive reasoning of a **Local LLM (Ollama + Llama 3)** for zero-leakage, HIPAA-compliant API validation.

---

## ✨ Why This Framework?

| Capability | Traditional Automation | This Framework |
|---|---|---|
| 🔍 Assertion Type | Static schema/value match | Dynamic clinical business logic |
| 🔒 Data Privacy | Cloud API (PHI risk) | 100% local — zero data leakage |
| 💰 Cost at Scale | Per-token API charges | Free — runs on local hardware |
| 🧠 Reasoning Depth | `status === 200` | Copay logic, rejection code semantics |
| 🌐 Offline Support | ❌ | ✅ Mock LLM fallback mode |

---

## 🌟 Key Benefits

### 🔬 1. Dynamic Business Logic Verification
Traditional test automation uses static assertions — checking schemas or exact value matches. This framework uses a Local LLM to analyze the *context* and *clinical business rules* of responses. For example, it validates whether a rejection code relationship is correct, or whether a patient co-pay makes sense for a specific drug class.

### 🛡️ 2. Zero-Dependency Local Testing (Mock LLM Fallback)
If Ollama is not installed locally or is offline, the framework automatically triggers an **intelligent mock fallback mode** (`MOCK_LLM=true`). The mock simulates logical clinical reasoning and calculation audits programmatically, ensuring test runs succeed in local environments or sandboxed CI/CD pipelines.

### 🏥 3. Integrated Adjudication Simulator
The framework ships with a built-in mock HTTP API server that spins up dynamically on port `3001` prior to test execution — enabling testing of genuine HTTP request/response payloads, headers, and status codes without any external dependencies.

### 📊 4. Rich Technical Reporting via Allure
Every test run attaches full traceability into the **Allure Dashboard**, including:
- 📨 Full HTTP request headers and payloads
- 📩 Full HTTP response headers, payloads, and latency
- 🤖 AI validation prompt contexts and structured JSON reasoning records

---

## 🏗️ Architecture & How It Works

### 🔄 API Validation Pipeline

Every transaction flows through a step-by-step verification pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API VALIDATION PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐     POST/GET      ┌──────────────────┐
  │  🎭 Playwright   │ ───────────────▶  │  🔌 ApiClient    │
  │   Test Runner    │                   │    Wrapper       │
  └──────────────────┘                   └────────┬─────────┘
                                                  │ Network Request
                                                  ▼
                                         ┌──────────────────┐
                                         │  🏥 Adjudication │
                                         │  API/Mock Server │
                                         │   (port 3001)    │
                                         └────────┬─────────┘
                                                  │ HTTP Response JSON
                                                  ▼
                                         ┌──────────────────┐
                                         │  ⚙️ Validation   │
                                         │    Service       │
                                         └────────┬─────────┘
                                                  │ Context Prompt + Payload
                                                  ▼
                                         ┌──────────────────┐
                                         │  🤖 AiValidator  │
                                         └────────┬─────────┘
                                                  │ ollama.chat()
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │        🦙 Local LLM           │
                                  │    Ollama + Llama 3           │
                                  │  (100% local — no PHI leak)   │
                                  └───────────────┬───────────────┘
                                                  │ Structured JSON
                                                  ▼
                                         ┌──────────────────┐
                                         │  📎 Allure       │
                                         │  Report Helper   │
                                         └────────┬─────────┘
                                                  │ HTML Report
                                                  ▼
                                         ┌──────────────────┐
                                         │  📊 Allure       │
                                         │   Dashboard      │
                                         └──────────────────┘
```

### 🧠 Why Integrate a Local LLM?

#### 1. 🩺 Dynamic Reasoning Over Complex Healthcare Contracts
Standard automation is limited to matching rigid properties (e.g., checking if `status` equals `200`). Healthcare adjudication requires evaluating logical contradictions across multiple fields. The LLM checks:
- Is a **Specialty drug** being incorrectly processed as a generic Tier-1 drug?
- If a claim is rejected, is the **rejection description** contextually aligned with standard PBM regulations?
- Does the **member copay** make mathematical sense compared to their deductible accumulation?

#### 2. 🔒 Strict Data Privacy (HIPAA Compliance)
Healthcare records are regulated under HIPAA, prohibiting transmission of Protected Health Information (PHI) to third-party public cloud APIs (like OpenAI or Anthropic) without expensive Business Associate Agreements (BAAs). Because Ollama hosts `llama3` **entirely on local hardware**, all claims, pricing records, and eligibility payloads are validated offline with **zero data leakage**.

#### 3. 💸 Reduced Cost and Latency at Scale
Auditing thousands of regression tests using public APIs incurs severe token costs and network overhead. Running Ollama locally eliminates per-token API charges and provides predictable execution speeds.

#### 🔧 How the LLM is Called in Code

```typescript
import ollama from 'ollama';

// Configure the Ollama API host (Defaults to http://localhost:11434)
process.env.OLLAMA_HOST = env.ollamaHost;

const response = await ollama.chat({
  model: 'llama3',
  messages: [{ role: 'user', content: prompt }],
  format: 'json',        // Enforces valid JSON syntax in the output
  options: {
    temperature: 0.1,    // Near-zero = maximum audit consistency
  }
});

const validationResult = JSON.parse(response.message.content);
```

---

### 🔮 Future: Model Context Protocol (MCP) Integration

MCP is a standard that allows LLMs to interact securely with external tools and resources:

```
┌───────────────────────────────────────────────────────────────────┐
│                    FUTURE MCP ARCHITECTURE                        │
└───────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────┐
         │       🦙 Local LLM       │
         │    (Ollama + Llama 3)    │
         └──────────┬───────────────┘
                    │
          ┌─────────┴──────────┐
          │    MCP Protocol    │
          └────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────────┐
│ 📁 Filesystem │    │  🐘 PostgreSQL MCP │
│     MCP       │    │                    │
├───────────────┤    ├────────────────────┤
│ read_file     │    │ Query deductible    │
│ write_file    │    │ accumulator tables │
│ list_dir      │    │ after PAID status  │
│               │    │                    │
│ Read offline  │    │ Confirm DB was     │
│ claim EDI     │    │ updated by API     │
│ files & plans │    │ response           │
└───────────────┘    └────────────────────┘
```

---

## 📂 Project Structure

```
ai-api-validator/
│
├── 📁 src/
│   ├── 🤖 ai/
│   │   ├── aiValidator.ts          # Ollama communication, JSON output, mock fallback
│   │   └── validationService.ts    # Contextual prompt wrappers (Claims, Eligibility, Pricing)
│   │
│   ├── ⚙️  config/
│   │   └── environment.ts          # Config loaded from environment variables
│   │
│   ├── 🔌 mcp/                     # Placeholders for future MCP servers
│   │   ├── filesystem/             # For reading raw claims/eligibility files
│   │   └── postgres/               # For database accumulator assertions
│   │
│   ├── 🧪 tests/
│   │   ├── fixtures/
│   │   │   └── mockClaimsData.ts   # Realistic pharmacy claim datasets (Metformin, Humira, Nexium)
│   │   └── claimValidation.spec.ts # Core test runner — 7 API scenarios
│   │
│   └── 🛠️  utils/
│       ├── apiClient.ts            # Playwright APIRequestContext wrapper
│       ├── logger.ts               # Timestamped, severity-leveled logging
│       └── reportHelper.ts         # Attaches request, response, AI logic to Allure
│
├── 📄 .env                         # Local environment configuration
├── 📄 .env.example                 # Environment configuration template
├── 📦 package.json                 # Scripts, dependencies, devDependencies
├── 🎭 playwright.config.ts         # Playwright orchestration & Allure plugin config
└── 🔷 tsconfig.json                # TypeScript compiler rules
```

---

## 🧪 Test Scenarios — Deep Dive

### Mock API Endpoints (port `3001`)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADJUDICATION SIMULATOR                        │
├───────────────────────┬──────────────────────────────────────────┤
│ Endpoint              │ Scenario                                 │
├───────────────────────┼──────────────────────────────────────────┤
│ POST /claims/metformin│ ✅ Standard Paid Claim                   │
│ POST /claims/humira   │ ❌ Specialty Rejection — Code 75         │
│ POST /claims/nexium   │ ❌ Non-Formulary Rejection — Code 70     │
│ GET  /eligibility/active   │ ✅ Active Member                   │
│ GET  /eligibility/inactive │ ❌ Lapsed Coverage                 │
│ GET  /pricing/correct      │ ✅ Correct Discount Math           │
│ GET  /pricing/incorrect    │ ⚠️  Calculated Discrepancy         │
└───────────────────────┴──────────────────────────────────────────┘
```

### Test Execution Flow

```
beforeAll                             afterAll
   │                                     │
   ▼                                     ▼
🚀 Spin up Mock Server          🛑 Tear down Mock Server
   (port 3001)                       (port 3001)
   │
   ▼
🔌 ApiClient → HTTP Request
   │
   ▼
📡 Mock Server responds with JSON
   │
   ▼
⚙️  ValidationService builds prompt
   │
   ▼
🤖 AiValidator sends to Ollama
   │
   ▼
🦙 Llama 3 returns { status, reasoning }
   │
   ▼
📊 ReportHelper attaches to Allure
   │
   ▼
✅ / ❌  Assert PASS / FAIL
```

---

## 🛠️ Setup Guide

### 📦 Step 1 — Install Node.js Dependencies

Ensure **Node.js v18+** is installed, then:

```bash
npm install
```

### 🦙 Step 2 — Install Ollama (Local LLM)

> Skip this step if you plan to run in mock mode (`MOCK_LLM=true`).

1. **Download Ollama** from [ollama.com/download/windows](https://ollama.com/download/windows) and run the installer.

2. **Pull the Llama 3 model** (~4.7 GB):
   ```bash
   ollama pull llama3
   ```

3. **Verify Ollama is running** — navigate to `http://localhost:11434`. You should see `"Ollama is running"`.

4. **Confirm model registration**:
   ```bash
   ollama list
   # Expected: llama3:latest
   ```

---

## 🚀 Running the Framework

### ⚙️ Configure Environment

Open `.env` and toggle the `MOCK_LLM` flag:

```env
# false = query your local Ollama LLM
# true  = use intelligent mock fallback (no Ollama required)
MOCK_LLM=false
```

### ▶️ Run Tests

```bash
npx playwright test
```

> 💡 First run under live AI mode may take 5–10s while Ollama loads Llama 3 into memory.

### 📊 Generate Allure Report

```bash
npm run report:generate
```

### 🌐 View Allure Dashboard

```bash
npm run report:open
```

### 🧹 Clean Previous Results

```bash
npm run clean
```

---

## 🔒 HIPAA Compliance at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                 DATA FLOW GUARANTEE                     │
│                                                         │
│   ┌──────────┐    ┌──────────┐    ┌────────────────┐   │
│   │  Claims  │───▶│  Ollama  │───▶│ Validation     │   │
│   │   PHI    │    │ (LOCAL)  │    │ Result (JSON)  │   │
│   └──────────┘    └──────────┘    └────────────────┘   │
│                                                         │
│   ✅ All processing on local hardware                   │
│   ✅ Zero network calls to external APIs                │
│   ✅ No BAA required                                    │
│   ✅ No per-token cloud billing                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Tech Stack

| Layer | Technology |
|---|---|
| 🎭 Test Runner | Playwright (TypeScript) |
| 🤖 AI Engine | Ollama + Llama 3 (local) |
| 🏥 API Simulator | Node.js HTTP Server (port 3001) |
| 📊 Reporting | Allure Reporter |
| 🔷 Language | TypeScript |
| 🌐 Future MCP | Filesystem + PostgreSQL MCP Servers |
