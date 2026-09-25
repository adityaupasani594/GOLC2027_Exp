import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../data/labData';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={15}
      expTitle="GraphRAG & Knowledge-Grounded Generation"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
