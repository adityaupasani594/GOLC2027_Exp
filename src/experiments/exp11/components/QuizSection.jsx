import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';
import { QUIZ_QUESTIONS } from '../schemaDesignEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={11}
      expTitle="Ontology & Knowledge Graph Schema Design"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
