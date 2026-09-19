# Virtual Laboratory Experiment Template (Streamlit)

A generic, modular Python Streamlit virtual lab template partitioned into 4 core sections:

1. **Theory**: Concepts, background overview, learning objectives, procedure steps, and key terminology.
2. **Simulation**: Interactive parameter controls, execution model, dynamic response plots, and experimental trial data logger with CSV export.
3. **Quiz**: Pre/post-lab conceptual assessment with automatic self-grading, explanations, and score persistence.
4. **Report Generation**: Student details, logged trial records, quiz performance, discussion notes, and downloadable PDF report.

---

## Quick Start

```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## Customization Guide

All logic is self-contained in [`app.py`](app.py):
1. **Metadata & Objectives**: Edit `EXPERIMENT_CONFIG` at the top of `app.py`.
2. **Theory & Procedure**: Edit `THEORY_CONTENT`.
3. **Simulation Model**: Customize parameters in `SIMULATION_CONFIG` and logic in `run_simulation()`.
4. **Quiz Questions**: Edit `QUIZ_QUESTIONS`.
5. **No custom CSS is used**, ensuring full native compatibility with Streamlit light and dark themes.
