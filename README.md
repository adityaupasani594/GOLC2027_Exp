# Virtual Laboratory Experiment Platform

A comprehensive virtual laboratory platform partitioned into a modern **React + Vite + Tailwind CSS v4 Frontend** in the root directory and a modular **Python / Streamlit Simulation Backend** in `backend/`.

---

## Project Structure

```
.
├── backend/                  # Python Streamlit Virtual Lab & Model
│   ├── template.py           # Streamlit application with full simulation logic
│   ├── requirements.txt      # Python dependencies
│   ├── lab_report.pdf        # Generated sample report
│   ├── README.md             # Backend setup & documentation
│   └── .venv/                # Python virtual environment
├── src/                      # React Frontend Source
│   ├── components/           # UI Components
│   │   ├── Navbar.jsx        # Navigation header with progress indicators
│   │   ├── TheorySection.jsx # Theory, learning objectives, procedure & glossary
│   │   ├── SimulationSection.jsx # Controls, real-time metrics & trial logging
│   │   ├── WaveformChart.jsx # Interactive SVG dynamic response chart
│   │   ├── QuizSection.jsx   # Self-grading assessment with instant explanations
│   │   └── ReportSection.jsx # Certified laboratory report compilation & PDF print
│   ├── data/
│   │   └── labData.js        # Lab configurations, models, and question banks
│   ├── App.jsx               # Main React Application
│   ├── index.css             # Tailwind CSS v4 & custom design styles
│   └── main.jsx              # React DOM entry point
├── index.html                # Vite HTML template
├── package.json              # Frontend npm packages & scripts
├── vite.config.js            # Vite configuration with @tailwindcss/vite
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Frontend (React + Vite + Tailwind CSS v4)

In the root directory:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:5173` in your browser.

---

### 2. Backend (Streamlit Virtual Lab)

To run the standalone Python backend:

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Run the Streamlit application
streamlit run template.py
```

Open `http://localhost:8501` in your browser.
