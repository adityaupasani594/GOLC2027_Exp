import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export default function ReportSection({ quizScore, totalQuestions, studentInfo, trials }) {
  const [notes, setNotes] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => setGenerated(true);

  const date = new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
  const pct = totalQuestions > 0 ? Math.round((quizScore / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Lab Report — IR + Knowledge Graph Integration</h1>
          <p className="text-xs text-slate-500">Knowledge Graphs and Information Retrieval Systems</p>
        </div>
      </div>

      {/* Observations */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-3">Student Observations</h2>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Enter your observations from the simulation. What queries did you try? How did graph context help understand the retrieved documents? Compare retrieval with and without graph exploration."
          className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 font-medium"
          rows={5} />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Quiz Score', val: quizScore != null ? quizScore+'/'+totalQuestions : 'Not taken' },
          { label:'Score %', val: quizScore != null ? pct+'%' : '—' },
          { label:'Trials Recorded', val: trials.length },
          { label:'Date', val: date },
        ].map(({ label, val }) => (
          <div key={label} className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
            <div className="text-xl font-black text-teal-700">{val}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Trials Table */}
      {trials.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-2">Recorded Experimental Trials</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-teal-700 text-white">{['#','Query','Top-K','Hits','Top Score','Top Document','Selected Doc','Graph Edges'].map(h => <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {trials.map((t, i) => (
                  <tr key={t.id} className={i%2===0?'bg-white':'bg-slate-50'}>
                    <td className="px-3 py-2 font-mono font-bold text-teal-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-800 font-medium max-w-xs truncate">{t.query}</td>
                    <td className="px-3 py-2 text-center font-bold text-slate-700">{t.topK}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{t.hits}</td>
                    <td className="px-3 py-2 font-mono text-violet-700 font-bold">{t.topScore}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{t.topDoc}</td>
                    <td className="px-3 py-2 font-mono text-teal-700 font-bold">{t.selectedDoc}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{t.graphEdges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generated ? (
        <div className="flex justify-center">
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.98 }} onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
            <FileText className="w-4 h-4" />Generate Report
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-emerald-800">Report Generated</span>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <div><span className="font-semibold">Experiment:</span> Experiment 14 — Integration of Information Retrieval with Knowledge Graphs</div>
            <div><span className="font-semibold">Course:</span> Knowledge Graphs and Information Retrieval Systems</div>
            <div><span className="font-semibold">Student:</span> {studentInfo?.name || 'Not entered'}</div>
            <div><span className="font-semibold">Roll No.:</span> {studentInfo?.studentId || 'Not entered'}</div>
            <div><span className="font-semibold">Date:</span> {date}</div>
            <div><span className="font-semibold">Quiz Score:</span> {quizScore != null ? quizScore+'/'+totalQuestions+' ('+pct+'%)' : 'Not taken'}</div>
            <div><span className="font-semibold">Trials Completed:</span> {trials.length}</div>
            {notes && <div><span className="font-semibold">Observations:</span> {notes}</div>}
          </div>
        </motion.div>
      )}
    </div>
  );
}
