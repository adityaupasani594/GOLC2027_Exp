import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../relationshipExtractionEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={9}
      expTitle="Relationship & Fact Extraction for KGs"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
