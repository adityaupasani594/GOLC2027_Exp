import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../graphQueryEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={12}
      expTitle="Complex Graph Queries & Path Traversal"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
