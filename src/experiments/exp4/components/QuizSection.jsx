import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../tfidfEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={4}
      expTitle="Vector Space Model & TF-IDF Weighting"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
