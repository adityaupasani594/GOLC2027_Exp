import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, Award, ChevronRight } from 'lucide-react';

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

export default function QuizSection({ onNext, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const questions = useMemo(() => ALL_QUESTIONS, []);
  const score = submitted ? questions.filter(q => answers[q.id] === q.ans).length : 0;

  const handleAnswer = (qId, optIdx) => { if (!submitted) setAnswers(p => ({ ...p, [qId]: optIdx })); };

  const handleSubmit = () => {
    setSubmitted(true);
    const s = questions.filter(q => answers[q.id] === q.ans).length;
    onScoreUpdate && onScoreUpdate(s);
  };

  const q = questions[currentQ];
  const answered = answers[q.id] !== undefined;
  const isCorrect = submitted && answers[q.id] === q.ans;
  const isWrong = submitted && answered && answers[q.id] !== q.ans;
  const allAnswered = questions.every(qq => answers[qq.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Assessment Quiz</h1>
          <p className="text-xs text-slate-500">IR + Knowledge Graph Integration — {questions.length} Questions</p>
        </div>
        {submitted && (
          <div className="ml-auto px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-lg">
            {score}/{questions.length}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {questions.map((qq, i) => (
          <button key={qq.id} onClick={() => setCurrentQ(i)}
            className={'flex-1 h-2 rounded-full transition-all ' + (
              i === currentQ ? 'bg-rose-500' :
              submitted ? (answers[qq.id] === qq.ans ? 'bg-emerald-500' : 'bg-red-400') :
              answers[qq.id] !== undefined ? 'bg-indigo-400' : 'bg-slate-200'
            )} />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-sm font-black flex items-center justify-center">{currentQ+1}</span>
            <span className="text-sm font-bold text-slate-800">{q.q}</span>
          </div>
          <div className="space-y-2">
            {q.opts.map((opt, i) => {
              const sel = answers[q.id] === i;
              const correct = submitted && i === q.ans;
              const wrong = submitted && sel && i !== q.ans;
              return (
                <button key={i} onClick={() => handleAnswer(q.id, i)}
                  className={'w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition-all ' + (
                    correct ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                    wrong ? 'bg-red-50 border-red-400 text-red-800' :
                    sel ? 'bg-indigo-50 border-indigo-400 text-indigo-800' :
                    'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
                  )}>
                  <span className={'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black ' + (
                    correct ? 'bg-emerald-500 border-emerald-500 text-white' :
                    wrong ? 'bg-red-400 border-red-400 text-white' :
                    sel ? 'bg-indigo-500 border-indigo-500 text-white' :
                    'border-slate-300'
                  )}>
                    {correct ? '✓' : wrong ? '✗' : String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className={'mt-4 p-3 rounded-xl text-xs leading-relaxed ' + (isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200')}>
              {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> : <XCircle className="w-3.5 h-3.5 inline mr-1" />}
              {q.exp}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button disabled={currentQ===0} onClick={() => setCurrentQ(p=>p-1)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all">
          Previous
        </button>
        <span className="text-xs text-slate-400">{currentQ+1} / {questions.length}</span>
        {currentQ < questions.length-1 ? (
          <button onClick={() => setCurrentQ(p=>p+1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : !submitted ? (
          <button disabled={!allAnswered} onClick={handleSubmit}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-sm hover:bg-rose-600 disabled:opacity-40 transition-all">
            Submit Quiz
          </button>
        ) : (
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.98 }} onClick={onNext}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all">
            <Award className="w-4 h-4" />Get Certificate
          </motion.button>
        )}
      </div>
    </div>
  );
}
