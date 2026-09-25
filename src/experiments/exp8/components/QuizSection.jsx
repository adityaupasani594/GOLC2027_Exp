import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../entityGraphEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={8}
      expTitle="Identify Graph Entities & Probabilistic Retrieval"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
