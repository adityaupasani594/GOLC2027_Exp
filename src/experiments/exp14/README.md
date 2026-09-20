# Experiment 14

## Overview
This folder contains the modular implementation of **Experiment 14** for the Information Retrieval & Knowledge Graphs Virtual Laboratory (VESIT, Department of Computer Engineering).

## File Structure
- `index.jsx`: Main entry point and experiment runner component.
- `components/`: (Optional) Add custom interactive simulation UI, visualization charts, and control components here.
- `data/`: (Optional) Add experiment-specific dataset files, benchmarks, and quiz questions here.

## How to Extend
1. Import and utilize components inside `index.jsx`.
2. To provide a completely custom workbench, pass custom children into `<ExperimentTemplate expNumber={14} onBack={onBack}> ... </ExperimentTemplate>` or replace the template with your own custom layout.
