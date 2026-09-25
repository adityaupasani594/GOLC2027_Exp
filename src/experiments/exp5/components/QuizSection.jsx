import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../bm25Engine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={5}
      expTitle="BM25 Probabilistic Document Ranking"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
