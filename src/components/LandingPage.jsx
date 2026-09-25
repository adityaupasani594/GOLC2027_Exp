import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Cpu,
  Award,
  ChevronRight,
  GitFork,
  LayoutGrid,
  Users,
  GraduationCap,
  Code2,
  BookOpen,
  School
} from 'lucide-react';
import { EXPERIMENTS_LIST, EXPERIMENT_TRACKS } from '../data/experimentsData';
import ExperimentModal from './ExperimentModal';
import CurriculumGraph from './CurriculumGraph';
import collegeLogo from '../image.png';
import { LandingNavbar, Footer, AmbientBackground, ExperimentLikeButton } from './common';

export default function LandingPage({ onLaunchExperiment, onLaunchExp15, onNavigateToAuth, onOpenProfile }) {
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'cards'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedExpModal, setSelectedExpModal] = useState(null);

  const handleLaunch = (num) => {
    if (onLaunchExperiment) {
      onLaunchExperiment(num);
    } else if (onLaunchExp15) {
      onLaunchExp15();
    }
  };

  // Filtered experiments list for card view
  const filteredExperiments = useMemo(() => {
    return EXPERIMENTS_LIST.filter(exp => {
      // Track filter
      if (selectedTrack !== 'all' && exp.track !== selectedTrack) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesExplanation = exp.explanation.toLowerCase().includes(q);
        const matchesOutcome = exp.expectedOutcome.toLowerCase().includes(q);
        const matchesTopics = exp.keyTopics?.some(t => t.toLowerCase().includes(q));
        const matchesTech = exp.techStack?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExplanation && !matchesOutcome && !matchesTopics && !matchesTech) {
          return false;
        }
      }

      return true;
    });
  }, [selectedTrack, searchQuery]);

  return (
    <div className="min-h-screen text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── Fixed Ambient Lighting Background ── */}
      <AmbientBackground />

      {/* ── Top Header / Navbar ── */}
      <LandingNavbar
        onNavigateToAuth={onNavigateToAuth}
        onNavigateToLab={handleLaunch}
        onOpenProfile={onOpenProfile}
      />

      {/* ── Hero Section ── */}
      <section className="relative pt-12 pb-14 lg:pt-20 lg:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-indigo-100 shadow-sm text-indigo-700 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department of Computer Engineering • VESIT • Academic Year 2026–2027</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] sm:leading-[1.1]"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                KIRA Lab
              </span>
              <div className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 mt-2 sm:mt-3 tracking-normal">
                Knowledge Graph & Information Retrieval Analytics Lab
              </div>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              An interactive virtual analytics laboratory arranged in a learning graph — from text preprocessing and inverted indexing, to knowledge graphs, neural semantic search, and quantitative empirical evaluation.
            </motion.p>

            {/* Quick Actions & Jump to Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#catalog"
                onClick={() => setViewMode('graph')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <GitFork className="w-4 h-4 rotate-90" />
                <span>Explore Experiment Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#tracks"
                className="px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                View 4 Tracks
              </a>
            </motion.div>

            {/* Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
            >
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">15</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Total Experiments</p>
              </div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-violet-600">4</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Curriculum Tracks</p>
              </div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600">Interactive</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Visual Simulations</p>
              </div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Empirical Evaluation</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Curriculum Tracks Breakdown ── */}
      <section id="tracks" className="py-10 sm:py-14 border-t border-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Curriculum Roadmap
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Four Progressive Laboratory Tracks
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Structured step-by-step syllabus from basic text processing to enterprise graph retrieval and evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Track 1 */}
            <div
              onClick={() => { setSelectedTrack('foundations'); setViewMode('cards'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                01
              </div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Track I • Foundations</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">IR Foundations & Indexing</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pipelines, normalization, tokenization, postings lists, TF-IDF vector space, and BM25 probabilistic ranking.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:gap-1.5 transition-all">
                <span>Explore Track Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 2 */}
            <div
              onClick={() => { setSelectedTrack('semantic'); setViewMode('cards'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                02
              </div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Track II • Semantic</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">Semantic & Hybrid Search</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dense neural embeddings, bi-encoders, FAISS indexing, and Reciprocal Rank Fusion of lexical and semantic vectors.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 group-hover:gap-1.5 transition-all">
                <span>Explore Track Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 3 */}
            <div
              onClick={() => { setSelectedTrack('graphs'); setViewMode('cards'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                03
              </div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Track III • Knowledge Graphs</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">Knowledge Graphs</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Entity recognition, relation extraction triples, knowledge graph schema design, data import, and traversal.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:gap-1.5 transition-all">
                <span>Explore Track Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 4 */}
            <div
              onClick={() => { setSelectedTrack('evaluation'); setViewMode('cards'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                04
              </div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Track IV • Evaluation</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">Integration & Evaluation</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                GraphRAG contextual expansion and empirical benchmarking (Precision, Recall, F1, MRR) across all retrieval models.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-rose-600 group-hover:gap-1.5 transition-all">
                <span>Explore Track Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum Structure Section (Graph View / Cards View) ── */}
      <section id="catalog" className="py-12 sm:py-16 scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with View Switcher */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Curriculum Structure
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {viewMode === 'graph' ? 'Prerequisite Learning Graph' : 'All Laboratory Modules'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {viewMode === 'graph'
                  ? 'Interactive DAG: Directed edges (A → B) indicate that module A must be completed before module B.'
                  : 'Filter by curriculum track or search by topic, title, or keywords.'}
              </p>
            </div>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'graph'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <GitFork className="w-3.5 h-3.5 rotate-90" />
                <span>Directed Graph</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards View</span>
              </button>
            </div>
          </div>

          {/* ── View Mode: Directed Graph ── */}
          {viewMode === 'graph' && (
            <div className="mt-4">
              <CurriculumGraph
                onSelectExperiment={(exp) => setSelectedExpModal(exp)}
                onLaunchExp15={() => handleLaunch(15)}
                onLaunchExperiment={handleLaunch}
              />
            </div>
          )}

          {/* ── View Mode: Grid Cards ── */}
          {viewMode === 'cards' && (
            <div>
              {/* Filter controls in Cards View */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                {/* Track Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto">
                  {EXPERIMENT_TRACKS.map(track => (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedTrack === track.id
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80'
                        }`}
                    >
                      {track.label}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${selectedTrack === track.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {track.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search experiments or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Experiments Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiments.map(exp => {
                  const isExp15 = exp.number === 15;

                  return (
                    <div
                      key={exp.id}
                      className="flex flex-col justify-between rounded-2xl p-6 transition-all bg-white/80 backdrop-blur-sm border border-slate-200/90 hover:border-indigo-200 hover:shadow-lg"
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {exp.trackLabel}
                          </span>

                          <ExperimentLikeButton expId={exp.number} variant="card" />
                        </div>

                        {/* Title */}
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                          {exp.title}
                        </h4>

                        {/* Prerequisites indicator */}
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                          {exp.prerequisites.length === 0 ? (
                            <span className="text-slate-400 italic">No prerequisites</span>
                          ) : (
                            <span className="text-indigo-600">
                              Prerequisite: {exp.prerequisites.map(p => {
                                const found = EXPERIMENTS_LIST.find(e => e.number === p);
                                return found ? (found.shortTitle || found.title) : 'Prerequisite';
                              }).join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Explanation */}
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {exp.explanation}
                        </p>

                        {/* Expected Outcome callout */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Expected Outcome:</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {exp.expectedOutcome}
                          </p>
                        </div>

                        {/* Key Topics tags */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {exp.keyTopics?.slice(0, 3).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedExpModal(exp)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Syllabus</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLaunch(exp.number)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Launch Lab</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredExperiments.length === 0 && (
                <div className="text-center py-16 bg-white/60 rounded-2xl border border-slate-200">
                  <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-700">No experiments found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search query or reset your filter.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedTrack('all'); }}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Student Academic Guidelines ── */}
      <section className="py-12 bg-white/40 border-t border-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Laboratory Protocol
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
              Submission & Assessment Guidelines
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Standard operating procedure for laboratory assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">1. Automated Lab Reports</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Generate standardized laboratory reports directly from the experiment interface. Save as PDF or print with all empirical metric tables intact.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">2. Knowledge Assessment</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Complete the built-in concept quiz with a passing score (≥ 60%) to earn your verified course completion certificate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">3. Code & Reproducibility</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Ensure code submissions include benchmark scripts, dependencies, and reproducible output logs matching the experimental protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section id="team" className="py-16 sm:py-20 bg-white/70 backdrop-blur-md border-t border-slate-200/80 scroll-mt-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Institutional Crest & Section Title */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-slate-200/90 mb-5">
              <img
                src={collegeLogo}
                alt="VESIT College Logo"
                className="h-[100px] sm:h-[150px] w-auto max-w-[400px] sm:max-w-[600px] object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100/90 inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Department of Computer Engineering
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Project Team & Contributors
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
                Vivekanand Education Society's Institute of Technology (VESIT)
                <br />
                <span className="text-xs text-slate-500 font-medium">
                  Autonomous Institute Affiliated to University of Mumbai • Accredited by NAAC with 'A' Grade
                </span>
              </p>
            </div>
          </div>

          {/* ── 1. Faculty Mentors (3 Faculties) ── */}
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-6 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Faculty Mentors & Guidance
                </h4>
                <p className="text-xs text-slate-500">
                  Curriculum design, academic oversight, and project mentorship.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 (Blue) - Faculty 1: Dr. Sharmila Sengupta */}


              {/* Column 2 (Yellow) - Faculty 2: Mrs. Abha Tewari */}
              <div className="relative group p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-400 shadow-sm hover:shadow-md hover:shadow-amber-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-amber-200 shrink-0">
                    AT
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      Mrs. Abha Tewari
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3 (Green) - Faculty 3: Mrs. Sunita Suralkar */}
              <div className="relative group p-6 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-md hover:shadow-emerald-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-200 shrink-0">
                    SS
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                      Mrs. Sunita Suralkar
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative group p-6 rounded-2xl bg-white border border-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md hover:shadow-blue-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-200 shrink-0">
                    SS
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      Dr. Sharmila Sengupta
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Student UI Integration Team (3 Members) ── */}
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-6 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shadow-xs">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Student UI Integration Team
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 (Blue) - Member 1: Aditya Upasani */}
              <div className="relative group p-6 rounded-2xl bg-white border border-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md hover:shadow-blue-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-red-200 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-200 shrink-0">
                    AU
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      Aditya Upasani
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2 (Yellow) - Member 2: Vedant Mhatre */}
              <div className="relative group p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-400 shadow-sm hover:shadow-md hover:shadow-amber-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-800 to-purple-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-amber-200 shrink-0">
                    VM
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      Vedant Mhatre
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3 (Green) - Member 3: Yash Mahajan */}
              <div className="relative group p-6 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-md hover:shadow-emerald-50 transition-all flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-800 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-200 shrink-0">
                    YM
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                      Yash Mahajan
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Department of Computer Engineering, VESIT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Laboratory Contributors (Students of Dept of Computer Engineering, VESIT, 2027 Batch) ── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden border border-indigo-900/60">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10 mb-3">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Curriculum & Laboratory Contributors</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Students of the Department of Computer Engineering, VESIT
                </h4>
                <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                  The laboratory contributors are the students of the Department of Computer Engineering, Vivekanand Education Society's Institute of Technology (VESIT), 2027 Batch. The experimental algorithms, theoretical formulations, domain datasets, knowledge graph schemas, and retrieval benchmarks across all laboratory modules were authored and contributed by the batch.
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center sm:text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">Full Labs</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Curriculum Suite</p>
                </div>
                <span className="text-xs text-indigo-300 font-semibold">
                  VESIT CMPN • 2027 Batch
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Experiment Detail Modal ── */}
      <ExperimentModal
        experiment={selectedExpModal}
        isOpen={!!selectedExpModal}
        onClose={() => setSelectedExpModal(null)}
        onLaunchExperiment={(num) => handleLaunch(num)}
        onLaunchExp15={() => handleLaunch(15)}
        onSelectOtherExp={(num) => {
          const target = EXPERIMENTS_LIST.find(e => e.number === num);
          if (target) setSelectedExpModal(target);
        }}
      />
    </div>
  );
}
