import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

const ALL_QUESTIONS = [
  { id:1, q:'What is the primary purpose of Information Retrieval?', opts:['Find and rank relevant documents','Create database tables','Encrypt documents','Delete unrelated documents'], ans:0, exp:'IR retrieves and ranks documents according to their relevance to the user information need.' },
  { id:2, q:'What does a node represent in the knowledge graph?', opts:['Only a numerical score','An entity or document','A retrieval algorithm','A quiz question'], ans:1, exp:'The demonstration graph contains document and entity nodes.' },
  { id:3, q:'What does an edge represent?', opts:['A relationship between two nodes','A document word count','A quiz score','A search query'], ans:0, exp:'Edges encode typed relationships such as USES, SUPPORTS and EXPLORES.' },
  { id:4, q:'Why is graph context useful after retrieving a document?', opts:['It removes the need for documents','It reveals connected entities and relationships','It always guarantees a correct answer','It converts text into images'], ans:1, exp:'Graph exploration adds structured context around the retrieved document.' },
  { id:5, q:'What is the integrated workflow demonstrated here?', opts:['Query -> Retrieval -> Graph exploration','Query -> Delete -> Shutdown','Graph -> Formatting -> Printing','Quiz -> Retrieval -> Logout'], ans:0, exp:'The experiment combines document retrieval with graph-based entity and relationship exploration.' },
  { id:6, q:'What is graph traversal?', opts:['Following relationships from a node to connected nodes','Sorting quiz questions','Removing stopwords','Converting Python to HTML'], ans:0, exp:'Traversal explores connected nodes through graph relationships.' },
  { id:7, q:'What is the role of the retrieved document in the graph?', opts:['It acts as an entry point to related entities','It must always be deleted','It is never connected to any entity','It is only for report formatting'], ans:0, exp:'Retrieved documents provide starting points for contextual graph exploration.' },
  { id:8, q:'Which statement best describes a Knowledge Graph?', opts:['A collection of unrelated text files','A graph of entities connected by typed relationships','A spreadsheet of scores','A programming language'], ans:1, exp:'Knowledge graphs explicitly represent entities and their relationships.' },
  { id:9, q:'What is entity extraction?', opts:['Finding meaningful entities in text','Sorting PDF pages','Selecting quiz options','Changing chart height'], ans:0, exp:'Entity extraction identifies concepts that can become graph nodes.' },
  { id:10, q:'What is hybrid retrieval?', opts:['A combination of lexical and semantic retrieval','A graph with no nodes','A quiz with no answers','A PDF with no text'], ans:0, exp:'Hybrid systems combine complementary retrieval methods.' },
];

export const QUIZ_QUESTIONS = ALL_QUESTIONS;


export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={14}
      expTitle="Hybrid Retrieval & Reciprocal Rank Fusion"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
