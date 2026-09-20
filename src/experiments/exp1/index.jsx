import React from 'react';
import ExperimentTemplate from '../ExperimentTemplate';

/**
 * Experiment 1
 * Modular implementation for Experiment 1.
 * Customize or replace the tabs below with dedicated components.
 */
export default function Experiment1({ onBack }) {
  return (
    <ExperimentTemplate expNumber={1} onBack={onBack} />
  );
}
