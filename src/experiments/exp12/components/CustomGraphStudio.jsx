import React, { useState } from 'react';
import {
  Wand2, Plus, Trash2, ArrowRight, BookOpen, Layers,
  CheckCircle2, Sparkles, Network, RefreshCw, AlertCircle
} from 'lucide-react';
import { getLabelStyle } from '../graphQueryEngine';

export default function CustomGraphStudio({
  customGraph,
  onAddNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onLoadPreset,
  onDone
}) {
  const [studioSubTab, setStudioSubTab] = useState('nodes'); // 'nodes' | 'edges' | 'presets'

  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('Person');
  const [customLabelText, setCustomLabelText] = useState('');
  const [newNodePropKey, setNewNodePropKey] = useState('');
  const [newNodePropVal, setNewNodePropVal] = useState('');

  // New Edge Form State
  const [newEdgeSource, setNewEdgeSource] = useState(customGraph.nodes[0]?.id || '');
  const [newEdgeType, setNewEdgeType] = useState('CONNECTED_TO');
  const [newEdgeTarget, setNewEdgeTarget] = useState(customGraph.nodes[1]?.id || customGraph.nodes[0]?.id || '');

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    const finalLabel = newNodeLabel === 'Custom' ? (customLabelText.trim() || 'Entity') : newNodeLabel;
    onAddNode({
      name: newNodeName.trim(),
      label: finalLabel,
      propKey: newNodePropKey.trim(),
      propVal: newNodePropVal.trim()
    });
    setNewNodeName('');
    setNewNodePropKey('');
    setNewNodePropVal('');
  };

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || !newEdgeType.trim()) return;
    onAddEdge({
      source: newEdgeSource,
      target: newEdgeTarget,
      type: newEdgeType.trim().toUpperCase().replace(/\s+/g, '_')
    });
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-5">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Custom Graph Studio
            </h3>
            <p className="text-[11px] text-slate-500">
              Create entities, attach properties, and build typed relationships.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-mono">
          {customGraph.nodes.length} Nodes · {customGraph.relationships.length} Edges
        </span>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setStudioSubTab('nodes')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            studioSubTab === 'nodes' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Nodes ({customGraph.nodes.length})
        </button>
        <button
          onClick={() => setStudioSubTab('edges')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            studioSubTab === 'edges' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Edges ({customGraph.relationships.length})
        </button>
        <button
          onClick={() => setStudioSubTab('presets')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            studioSubTab === 'presets' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Templates
        </button>
      </div>

      {/* SubTab 1: Nodes Management */}
      {studioSubTab === 'nodes' && (
        <div className="space-y-4">
          {/* Add Node Form */}
          <form onSubmit={handleCreateNode} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Add Node Entity
            </span>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Node Name (e.g. Alan Turing, Analytical Engine)
              </label>
              <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="Entity name..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Node Label / Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Person', 'Book', 'Movie', 'Organization', 'City', 'Machine', 'Concept', 'Custom'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setNewNodeLabel(l)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      newNodeLabel === l
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    :{l}
                  </button>
                ))}
              </div>
              {newNodeLabel === 'Custom' && (
                <input
                  type="text"
                  value={customLabelText}
                  onChange={(e) => setCustomLabelText(e.target.value)}
                  placeholder="Enter custom label name..."
                  className="mt-2 w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Property (Optional)
                </label>
                <input
                  type="text"
                  value={newNodePropKey}
                  onChange={(e) => setNewNodePropKey(e.target.value)}
                  placeholder="Key (e.g. born)"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={newNodePropVal}
                  onChange={(e) => setNewNodePropVal(e.target.value)}
                  placeholder="Value (e.g. 1912)"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newNodeName.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Node to Graph
            </button>
          </form>

          {/* Active Nodes List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Custom Nodes ({customGraph.nodes.length})
            </span>
            {customGraph.nodes.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center italic">
                No nodes in graph. Use the form above to add your first entity.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {customGraph.nodes.map(n => {
                  const style = getLabelStyle(n.label);
                  const otherProps = Object.entries(n).filter(([k]) => !['id', 'name', 'label', 'x', 'y', 'vx', 'vy'].includes(k));
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: style.color }}
                        >
                          :{n.label}
                        </span>
                        <span className="font-bold text-slate-900">{n.name}</span>
                        {otherProps.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({otherProps.map(([k, v]) => `${k}: ${v}`).join(', ')})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteNode(n.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 2: Relationships Management */}
      {studioSubTab === 'edges' && (
        <div className="space-y-4">
          {customGraph.nodes.length < 2 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Minimum 2 Nodes Required
              </div>
              <p className="text-amber-700 leading-relaxed">
                A relationship connects a source node to a target node. Please create at least 2 nodes first.
              </p>
              <button
                onClick={() => setStudioSubTab('nodes')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                Go to Nodes Tab
              </button>
            </div>
          ) : (
            <>
              {/* Add Relationship Form */}
              <form onSubmit={handleCreateEdge} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  2. Connect Entities (Directed Edge)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Source Node (From)
                    </label>
                    <select
                      value={newEdgeSource}
                      onChange={(e) => setNewEdgeSource(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {customGraph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name} (:{n.label})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Target Node (To)
                    </label>
                    <select
                      value={newEdgeTarget}
                      onChange={(e) => setNewEdgeTarget(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {customGraph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name} (:{n.label})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Relationship Type
                  </label>
                  <input
                    type="text"
                    value={newEdgeType}
                    onChange={(e) => setNewEdgeType(e.target.value)}
                    placeholder="Type (e.g. WROTE, INVENTED, LIVES_IN)"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono uppercase text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['WROTE', 'INVENTED', 'CONNECTED_TO', 'BORN_IN', 'COLLABORATED_WITH', 'LOCATED_IN'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewEdgeType(t)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newEdgeSource || !newEdgeTarget || !newEdgeType.trim()}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Connect Entities (Add Edge)
                </button>
              </form>

              {/* Active Relationships List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Relationships ({customGraph.relationships.length})
                </span>
                {customGraph.relationships.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center italic">
                    No relationships connected yet.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {customGraph.relationships.map(r => {
                      const srcNode = customGraph.nodes.find(n => n.id === r.source);
                      const tgtNode = customGraph.nodes.find(n => n.id === r.target);
                      return (
                        <div
                          key={r.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                            <span className="font-bold text-slate-900 truncate">{srcNode?.name || r.source}</span>
                            <span className="font-mono text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              -[:{r.type}]-&gt;
                            </span>
                            <span className="font-bold text-slate-900 truncate">{tgtNode?.name || r.target}</span>
                          </div>
                          <button
                            onClick={() => onDeleteEdge(r.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Delete relationship"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* SubTab 3: Presets & Templates */}
      {studioSubTab === 'presets' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Domain Graph Templates
          </span>
          <p className="text-[11px] text-slate-500">
            Quickly load structured domain graphs to query or expand upon.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => onLoadPreset('starter')}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Ada Lovelace &amp; Early Computing</div>
                <div className="text-[11px] text-slate-500">3 nodes · 2 relationships (Person, Book, City)</div>
              </div>
              <span className="text-xs font-bold text-indigo-600">Load Seed</span>
            </button>

            <button
              onClick={() => onLoadPreset('pioneers')}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-300 text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Computer Science Pioneers</div>
                <div className="text-[11px] text-slate-500">9 nodes · 9 relationships (Turing, Babbage, Berners-Lee, Web, Enigma)</div>
              </div>
              <span className="text-xs font-bold text-teal-600">Load Domain</span>
            </button>

            <button
              onClick={() => onLoadPreset('clear')}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-rose-800">Clear All (Blank Slate)</div>
                <div className="text-[11px] text-slate-500">0 nodes · Start building entirely from scratch</div>
              </div>
              <span className="text-xs font-bold text-rose-600">Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Done Editing Button */}
      <button
        onClick={onDone}
        className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>Run Pattern Queries on This Graph</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
