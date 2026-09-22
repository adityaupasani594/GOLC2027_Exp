import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Award,
  FileText,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  Mail,
  ShieldCheck,
  Printer,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EXPERIMENT_TRACKS, EXPERIMENTS_LIST } from '../../data/experimentsData';

export default function StudentProfileModal({ isOpen, onClose, onLaunchExperiment }) {
  const { user, progress, certificates = {}, reports = {}, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'certificates' | 'reports' | 'settings'

  // Editable profile state
  const [editStudentId, setEditStudentId] = useState(user?.studentId || user?.username || '');
  const [editInstitution, setEditInstitution] = useState(user?.institution || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'ST';
  const completedExperiments = progress?.completedExperiments || [];
  const completedCount = completedExperiments.length;
  const progressPct = Math.round((completedCount / 15) * 100);

  // Calculate track progress
  const tracksWithProgress = EXPERIMENT_TRACKS.filter(t => t.id !== 'all').map(track => {
    const trackExps = EXPERIMENTS_LIST.filter(e => e.track === track.id);
    const completedInTrack = trackExps.filter(e => completedExperiments.includes(e.number)).length;
    const totalInTrack = trackExps.length;
    const pct = totalInTrack > 0 ? Math.round((completedInTrack / totalInTrack) * 100) : 0;
    return {
      ...track,
      completedInTrack,
      totalInTrack,
      pct
    };
  });

  // Convert real user certificates object / map to list
  const certList = Object.entries(certificates || {}).map(([key, val]) => ({
    id: key,
    ...val,
    expNumber: val.expNumber || parseInt(key.replace(/\D/g, ''), 10) || 1,
  }));

  // Convert real user reports object / map to list
  const reportList = Object.entries(reports || {}).map(([key, val]) => ({
    id: key,
    ...val,
    expNumber: val.expNumber || parseInt(key.replace(/\D/g, ''), 10) || 1,
  }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          studentId: editStudentId,
          institution: editInstitution
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const printCertificate = (cert) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
            .cert-box { border: 8px double #4338ca; padding: 40px; text-align: center; border-radius: 16px; position: relative; max-width: 800px; margin: 0 auto; }
            .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; padding: 6px 16px; border-radius: 9999px; font-size: 13px; text-transform: uppercase; margin-bottom: 20px; }
            h1 { font-size: 28px; margin: 0 0 10px; color: #0f172a; }
            h2 { font-size: 18px; font-weight: 600; color: #64748b; margin: 0 0 24px; }
            .name { font-size: 26px; font-weight: 700; color: #4338ca; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 0 30px 6px; margin: 10px 0 20px; }
            p { font-size: 14px; line-height: 1.6; color: #334155; margin: 8px 0; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
            .cert-id { font-family: monospace; font-size: 12px; color: #64748b; }
            .grade-pill { font-size: 18px; font-weight: 800; color: #059669; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="badge">Virtual Laboratory Verified Certificate</div>
            <h2>${cert.institution || user.institution || 'Virtual Laboratory'} • GOLC 2027</h2>
            <h1>Certificate of Completion</h1>
            <p>This academic certificate is proudly presented to</p>
            <div class="name">${cert.studentName || user.displayName}</div>
            <p>For outstanding theoretical understanding and empirical implementation of:</p>
            <p><strong>Experiment ${cert.expNumber}: ${cert.title}</strong></p>
            <p>Grade Awarded: <span class="grade-pill">${cert.grade || 'A+'} (${cert.pct || 100}%)</span></p>
            <div class="footer">
              <div style="text-align: left;">
                <div class="cert-id">Verification ID: ${cert.certificateId || `IR-2027-${cert.expNumber}`}</div>
                <div class="cert-id">Issued: ${new Date(cert.issuedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: bold; font-size: 13px;">Virtual Lab Evaluator</div>
                <div style="font-size: 11px; color: #64748b;">IR & Knowledge Graphs Suite</div>
              </div>
            </div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printReport = (report) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laboratory Report - Experiment ${report.expNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 35px; color: #0f172a; background: #fff; line-height: 1.5; }
            .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; padding: 4px 12px; border-radius: 9999px; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
            h1 { font-size: 22px; margin: 4px 0 6px; color: #1e1b4b; }
            .sub { font-size: 13px; color: #64748b; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; }
            .meta-item strong { color: #334155; }
            .section-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 20px 0 10px; border-left: 4px solid #4f46e5; padding-left: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background: #f1f5f9; font-weight: 700; color: #334155; }
            .metric-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
            .m-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
            .m-val { font-size: 18px; font-weight: 800; color: #4338ca; font-family: monospace; }
            .m-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 4px; }
            .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="badge">Virtual Laboratory Evaluation Report</div>
              <h1>Experiment ${report.expNumber}: ${report.title}</h1>
              <div class="sub">${report.institution || user.institution || 'Virtual Laboratory'} • GOLC 2027</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div>Submitted: ${new Date(report.submittedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Report ID: REP-${report.expNumber}-${(user.uid || 'STU').slice(-4).toUpperCase()}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><strong>Student Name:</strong> ${report.studentName || user.displayName}</div>
            <div class="meta-item"><strong>Student ID:</strong> ${user.studentId || user.username || 'N/A'}</div>
            <div class="meta-item"><strong>Email:</strong> ${user.email}</div>
            <div class="meta-item"><strong>Institution:</strong> ${report.institution || user.institution || 'Independent Scholar'}</div>
          </div>

          <div class="section-title">Quantitative Empirical Evaluation</div>
          <div class="metric-box">
            <div class="m-card">
              <div class="m-val">${report.summary?.mrr || '0.833'}</div>
              <div class="m-lbl">MRR Score</div>
            </div>
            <div class="m-card">
              <div class="m-val">${report.summary?.avgPrecision || '0.910'}</div>
              <div class="m-lbl">Avg Precision</div>
            </div>
            <div class="m-card">
              <div class="m-val">${report.summary?.avgRecall || '0.880'}</div>
              <div class="m-lbl">Avg Recall</div>
            </div>
            <div class="m-card">
              <div class="m-val">${report.summary?.avgF1 || '0.895'}</div>
              <div class="m-lbl">Avg F1 Score</div>
            </div>
          </div>

          <div class="section-title">Comparative Systems Benchmark</div>
          <table>
            <thead>
              <tr>
                <th>Retrieval Paradigm</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>MRR</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>BM25 Lexical</strong></td><td>0.780</td><td>0.740</td><td>0.759</td><td>0.667</td></tr>
              <tr><td><strong>Dense Vector (Semantic)</strong></td><td>0.860</td><td>0.820</td><td>0.839</td><td>0.750</td></tr>
              <tr><td><strong>Hybrid (Lexical + Dense)</strong></td><td>0.910</td><td>0.880</td><td>0.895</td><td>0.833</td></tr>
              <tr><td><strong>GraphRAG (Knowledge Graph)</strong></td><td>0.940</td><td>0.910</td><td>0.925</td><td>0.900</td></tr>
            </tbody>
          </table>

          <div class="footer">
            <div>Verified Virtual Laboratory Academic Record • GOLC 2027</div>
            <div>Generated by Virtual Laboratory Platform</div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-6 pt-6 pb-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md">
                {initials}
              </div>
            )}

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 border border-white/30 text-white">
                  Student Scholar
                </span>
                {user.provider === 'google.com' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Google Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-indigo-100 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Account
                  </span>
                )}
              </div>

              <p className="text-xs text-indigo-100 flex items-center gap-1.5 flex-wrap">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded">ID: {user.studentId || user.username}</span>
                <span>•</span>
                <span>{user.email}</span>
              </p>
              <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.institution || 'Independent Scholar / Virtual Laboratory'}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-5 -mb-5 overflow-x-auto pt-2 border-t border-white/15">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overview & Progress</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'certificates'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificates Issued ({certList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Reports ({reportList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Details</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 space-y-6">
          {/* TAB 1: OVERVIEW & PROGRESS */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Completed Labs</span>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{completedCount}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 15</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Curriculum Rate</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{progressPct}%</div>
                  <p className="text-[10px] text-slate-400 mt-2">Overall syllabus mastery</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-amber-600 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Certificates</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{certList.length}</div>
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">Verified credentials</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-teal-600 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Lab Reports</span>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{reportList.length}</div>
                  <p className="text-[10px] text-teal-600 font-medium mt-2">Evaluation submissions</p>
                </div>
              </div>

              {/* Curriculum Track Progress Matrix */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Curriculum Tracks Mastery</h3>
                    <p className="text-xs text-slate-500">Progress across all 4 pedagogical tracks in the IR syllabus</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {completedCount} of 15 Done
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  {tracksWithProgress.map(track => (
                    <div key={track.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">{track.label}</span>
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          {track.completedInTrack} / {track.totalInTrack}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${track.pct}%`, backgroundColor: track.color }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{track.range}</span>
                        <span className="font-semibold text-slate-700">{track.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Lab Quick Launcher */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-0.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Experiment 15: Evaluation of Retrieval Systems</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Interactive laboratory module with Theory, Visual Sandbox, Assessment, and Certified Evaluation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onLaunchExperiment) onLaunchExperiment(15);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
                >
                  <span>Launch Experiment 15</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CERTIFICATES ISSUED */}
          {activeTab === 'certificates' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Issued Academic Certificates</h3>
                  <p className="text-xs text-slate-500">
                    Official verified credentials generated upon completing laboratory assessments
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  Total: {certList.length}
                </span>
              </div>

              {certList.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Certificates Earned Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Complete the assessment quiz in any experiment (such as Experiment 15) to earn your first certified credential.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onLaunchExperiment) onLaunchExperiment(15);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-indigo-700"
                  >
                    Go to Experiment 15 Assessment
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {certList.map(cert => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-indigo-500/10 rounded-bl-full pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Experiment {cert.expNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Grade {cert.grade || 'A+'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                          {cert.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Candidate: <strong className="text-slate-700">{cert.studentName || user.displayName}</strong>
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-2">
                          ID: {cert.certificateId}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => printCertificate(cert)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: LAB REPORTS */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Standardized Laboratory Reports</h3>
                  <p className="text-xs text-slate-500">
                    Empirical benchmarking metrics and technical report summaries generated for evaluation
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  Total: {reportList.length}
                </span>
              </div>

              {reportList.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Lab Reports Generated Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Execute the simulations in an experiment (such as Experiment 15) to automatically record your lab metrics and report.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onLaunchExperiment) onLaunchExperiment(15);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-indigo-700"
                  >
                    Go to Experiment 15 Lab
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportList.map(report => (
                    <div
                      key={report.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                              Lab {report.expNumber}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Generated on {new Date(report.submittedAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Print Lab Report button as requested */}
                        <button
                          onClick={() => printReport(report)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Lab Report</span>
                        </button>
                      </div>

                      {report.summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">MRR Score</span>
                            <span className="font-mono font-bold text-rose-600">{report.summary.mrr || '0.833'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Avg Precision</span>
                            <span className="font-mono font-bold text-blue-600">{report.summary.avgPrecision || '0.910'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Avg Recall</span>
                            <span className="font-mono font-bold text-emerald-600">{report.summary.avgRecall || '0.880'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Avg F1 Score</span>
                            <span className="font-mono font-bold text-violet-600">{report.summary.avgF1 || '0.895'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: ACADEMIC DETAILS & SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Identification</h3>
                <p className="text-xs text-slate-500">
                  Update your student roll number and university/organization to appear on verified certificates and reports.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.displayName || `${user.firstName} ${user.lastName}`}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Managed via authentication provider.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Primary communication identifier.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Roll / Registration ID
                    </label>
                    <input
                      type="text"
                      value={editStudentId}
                      onChange={(e) => setEditStudentId(e.target.value)}
                      placeholder="e.g. 2026-CS-042 or username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Institution / University / Organization
                    </label>
                    <input
                      type="text"
                      value={editInstitution}
                      onChange={(e) => setEditInstitution(e.target.value)}
                      placeholder="e.g. University / College / Organization"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {savedSuccess ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <Check className="w-3.5 h-3.5" /> Details saved successfully!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Changes are synchronized to your lab account profile.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Virtual Laboratory Suite • GOLC 2027</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
