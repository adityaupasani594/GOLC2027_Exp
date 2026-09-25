import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Search, ChevronRight, Zap, Database, 
  Layers, Compass, GitBranch, Cpu, Clock, CheckCircle, AlertCircle, 
  Sliders, ArrowRight, Share2, Eye, Sparkles, Filter, Code, Terminal,
  PlusCircle, RefreshCw, BarChart2, BookOpen, Check, HelpCircle,
  Download, FileText, Activity, Info, Network, Hash, Award, FastForward,
  Table, Copy, CheckCheck, ListFilter
} from 'lucide-react';

// Domain 1: Academic Citation & Co-authorship Network (template.py)
// Planar Non-Intersecting Layout
const ACADEMIC_GRAPH = {
  id: 'academic',
  name: 'Academic Citation & Co-authorship Network',
  description: 'Papers, Authors, and Conference Venues with multi-hop citation lineages and co-authorship triadic closures.',
  nodes: [
    // Tier 1: Authors (Top Row)
    { id: 'A4', label: 'Dr. Diana Patel', type: 'Author', domain: 'Robotics', hIndex: 19, color: '#f59e0b', x: 60, y: 55 },
    { id: 'A1', label: 'Dr. Alex Vance', type: 'Author', domain: 'AI / Deep Learning', hIndex: 34, color: '#f59e0b', x: 170, y: 55 },
    { id: 'A2', label: 'Dr. Beatrice Chen', type: 'Author', domain: 'Graph Theory', hIndex: 28, color: '#f59e0b', x: 290, y: 55 },
    { id: 'A3', label: 'Dr. Carlos Mendez', type: 'Author', domain: 'NLP & KG', hIndex: 22, color: '#f59e0b', x: 410, y: 55 },
    { id: 'A5', label: 'Dr. Elena Rostova', type: 'Author', domain: 'Comp Biology', hIndex: 31, color: '#f59e0b', x: 530, y: 55 },
    { id: 'A8', label: 'Dr. Haruto Tanaka', type: 'Author', domain: 'Computer Vision', hIndex: 24, color: '#f59e0b', x: 660, y: 55 },
    
    // Tier 1b: Systems Authors
    { id: 'A6', label: 'Dr. Faisal Khan', type: 'Author', domain: 'Graph Engines', hIndex: 26, color: '#f59e0b', x: 230, y: 240 },
    { id: 'A7', label: 'Dr. Grace Hopper-Jones', type: 'Author', domain: 'Compilers', hIndex: 45, color: '#f59e0b', x: 350, y: 240 },

    // Tier 2: Papers (Middle Rows)
    { id: 'P1', label: 'P1: Graph Transformer', type: 'Paper', year: 2023, citations: 142, venue: 'NeurIPS', color: '#2563eb', x: 120, y: 145 },
    { id: 'P2', label: 'P2: Multi-Hop Reasoner', type: 'Paper', year: 2022, citations: 98, venue: 'NeurIPS', color: '#2563eb', x: 230, y: 145 },
    { id: 'P6', label: 'P6: Subgraph Mining', type: 'Paper', year: 2022, citations: 112, venue: 'KDD', color: '#2563eb', x: 310, y: 145 },
    { id: 'P3', label: 'P3: Triadic Embeddings', type: 'Paper', year: 2021, citations: 185, venue: 'KDD', color: '#2563eb', x: 380, y: 145 },
    { id: 'P5', label: 'P5: KG Distillation', type: 'Paper', year: 2023, citations: 64, venue: 'ICLR', color: '#2563eb', x: 470, y: 145 },
    { id: 'P7', label: 'P7: Hyperbolic KG', type: 'Paper', year: 2021, citations: 156, venue: 'ICLR', color: '#2563eb', x: 550, y: 145 },
    { id: 'P9', label: 'P9: Neural Visual Graph', type: 'Paper', year: 2023, citations: 48, venue: 'NeurIPS', color: '#2563eb', x: 630, y: 145 },
    { id: 'P12', label: 'P12: Cross-modal Citation', type: 'Paper', year: 2020, citations: 76, venue: 'NeurIPS', color: '#2563eb', x: 710, y: 95 },

    // Tier 2b: Downstream Lineage Papers
    { id: 'P4', label: 'P4: Relational GNNs', type: 'Paper', year: 2020, citations: 210, venue: 'KDD', color: '#2563eb', x: 380, y: 220 },
    { id: 'P8', label: 'P8: Inductive Link Pred', type: 'Paper', year: 2020, citations: 245, venue: 'KDD', color: '#2563eb', x: 550, y: 220 },
    { id: 'P10', label: 'P10: Distributed Traversal', type: 'Paper', year: 2022, citations: 88, venue: 'SIGMOD', color: '#2563eb', x: 170, y: 315 },
    { id: 'P11', label: 'P11: Vectorized Cypher', type: 'Paper', year: 2021, citations: 130, venue: 'SIGMOD', color: '#2563eb', x: 290, y: 315 },

    // Tier 3: Venues (Bottom Row / Outer Anchors)
    { id: 'V1', label: 'NeurIPS Conf', type: 'Venue', tier: 'Top-tier A*', city: 'Paris', color: '#7c3aed', x: 60, y: 220 },
    { id: 'V2', label: 'KDD Conf', type: 'Venue', tier: 'Top-tier A*', city: 'Washington', color: '#7c3aed', x: 460, y: 240 },
    { id: 'V3', label: 'ICLR Conf', type: 'Venue', tier: 'Top-tier A*', city: 'Vienna', color: '#7c3aed', x: 660, y: 220 },
    { id: 'V4', label: 'SIGMOD Conf', type: 'Venue', tier: 'Top-tier A*', city: 'Seattle', color: '#7c3aed', x: 400, y: 315 }
  ],
  edges: [
    // AUTHORED (Clean vertical & short diagonal links)
    { id: 'e7', source: 'A4', target: 'P1', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e1', source: 'A1', target: 'P1', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e2', source: 'A1', target: 'P2', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e4', source: 'A2', target: 'P6', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e3', source: 'A2', target: 'P3', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e5', source: 'A3', target: 'P2', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e6', source: 'A3', target: 'P5', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e8', source: 'A5', target: 'P7', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e9', source: 'A5', target: 'P8', type: 'AUTHORED', label: 'AUTH', curve: 'M 530 55 Q 585 130 550 220' },
    { id: 'e13', source: 'A8', target: 'P9', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e14', source: 'A8', target: 'P12', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e10', source: 'A6', target: 'P10', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e11', source: 'A6', target: 'P11', type: 'AUTHORED', label: 'AUTH' },
    { id: 'e12', source: 'A7', target: 'P11', type: 'AUTHORED', label: 'AUTH' },

    // CITES (Horizontal chain & vertical drop without intersecting lines)
    { id: 'e15', source: 'P1', target: 'P2', type: 'CITES', label: 'CITES' },
    { id: 'e16', source: 'P2', target: 'P3', type: 'CITES', label: 'CITES', curve: 'M 230 145 Q 305 115 380 145' },
    { id: 'e17', source: 'P3', target: 'P4', type: 'CITES', label: 'CITES' },
    { id: 'e18', source: 'P1', target: 'P5', type: 'CITES', label: 'CITES', curve: 'M 120 145 Q 295 85 470 145' },
    { id: 'e19', source: 'P5', target: 'P7', type: 'CITES', label: 'CITES' },
    { id: 'e20', source: 'P7', target: 'P8', type: 'CITES', label: 'CITES' },
    { id: 'e21', source: 'P6', target: 'P3', type: 'CITES', label: 'CITES' },
    { id: 'e22', source: 'P9', target: 'P7', type: 'CITES', label: 'CITES' },
    { id: 'e23', source: 'P10', target: 'P11', type: 'CITES', label: 'CITES' },
    { id: 'e24', source: 'P12', target: 'P9', type: 'CITES', label: 'CITES' },

    // COLLABORATED_WITH (Top row linear chain & clean branch)
    { id: 'e28', source: 'A4', target: 'A1', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e25', source: 'A1', target: 'A2', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e26', source: 'A2', target: 'A3', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e27', source: 'A3', target: 'A5', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e31', source: 'A5', target: 'A8', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e30', source: 'A2', target: 'A6', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },
    { id: 'e29', source: 'A6', target: 'A7', type: 'COLLABORATED_WITH', label: 'CO_AUTH' },

    // PUBLISHED_IN (Clean perimeter & direct drops)
    { id: 'e32', source: 'P1', target: 'V1', type: 'PUBLISHED_IN', label: 'VENUE' },
    { id: 'e33', source: 'P2', target: 'V1', type: 'PUBLISHED_IN', label: 'VENUE', curve: 'M 230 145 Q 145 220 60 220' },
    { id: 'e34', source: 'P3', target: 'V2', type: 'PUBLISHED_IN', label: 'VENUE' },
    { id: 'e35', source: 'P4', target: 'V2', type: 'PUBLISHED_IN', label: 'VENUE' },
    { id: 'e36', source: 'P5', target: 'V3', type: 'PUBLISHED_IN', label: 'VENUE' },
    { id: 'e37', source: 'P6', target: 'V2', type: 'PUBLISHED_IN', label: 'VENUE', curve: 'M 310 145 Q 385 240 460 240' },
    { id: 'e38', source: 'P7', target: 'V3', type: 'PUBLISHED_IN', label: 'VENUE' },
    { id: 'e39', source: 'P10', target: 'V4', type: 'PUBLISHED_IN', label: 'VENUE', curve: 'M 170 315 Q 285 355 400 315' },
    { id: 'e40', source: 'P11', target: 'V4', type: 'PUBLISHED_IN', label: 'VENUE' }
  ]
};

// Domain 2: Professional Enterprise Network (app.py)
// Planar Layered Layout with Zero Overlaps
const ENTERPRISE_GRAPH = {
  id: 'enterprise',
  name: 'Professional Enterprise & Skill Network',
  description: 'Engineers, Projects, and Technologies with organizational hierarchy, cross-department relationships, and indirect influence paths.',
  nodes: [
    // Top Row: Projects
    { id: 'T1', label: 'Project Apollo (Graph RAG)', type: 'Project', budget: '$1.4M', color: '#2563eb', x: 140, y: 55 },
    { id: 'T2', label: 'Platform Titan (Vector DB)', type: 'Project', budget: '$2.8M', color: '#2563eb', x: 380, y: 55 },
    { id: 'T3', label: 'Project CyberLens', type: 'Project', budget: '$900K', color: '#2563eb', x: 620, y: 55 },

    // Middle Row: Engineers & Leadership
    { id: 'E1', label: 'Alice Smith', type: 'Person', role: 'Principal ML Eng', dept: 'AI Research', color: '#f59e0b', x: 140, y: 165 },
    { id: 'E2', label: 'Bob Jones', type: 'Person', role: 'Senior Backend Arch', dept: 'Core Infra', color: '#f59e0b', x: 260, y: 165 },
    { id: 'E4', label: 'David Kim', type: 'Person', role: 'Lead SRE & DevOps', dept: 'Core Infra', color: '#f59e0b', x: 380, y: 165 },
    { id: 'E3', label: 'Carol White', type: 'Person', role: 'Staff Data Eng', dept: 'Data Systems', color: '#f59e0b', x: 500, y: 165 },
    { id: 'E5', label: 'Eve Brown', type: 'Person', role: 'NLP Scientist', dept: 'AI Research', color: '#f59e0b', x: 620, y: 165 },
    { id: 'E6', label: 'Frank Garcia', type: 'Person', role: 'Director of Arch', dept: 'Leadership', color: '#f59e0b', x: 700, y: 240 },
    { id: 'E7', label: 'Grace Hopper', type: 'Person', role: 'Distinguished Fellow', dept: 'Leadership', color: '#f59e0b', x: 380, y: 265 },

    // Bottom Row: Skills
    { id: 'S2', label: 'PyTorch / GNN', type: 'Skill', category: 'ML', color: '#10b981', x: 80, y: 265 },
    { id: 'S1', label: 'Cypher & Neo4j', type: 'Skill', category: 'Graph DB', color: '#10b981', x: 200, y: 265 },
    { id: 'S4', label: 'Kubernetes', type: 'Skill', category: 'DevOps', color: '#10b981', x: 500, y: 265 },
    { id: 'S3', label: 'Rust & Opt.', type: 'Skill', category: 'Systems', color: '#10b981', x: 620, y: 265 }
  ],
  edges: [
    // WORKS_WITH (Linear Chain along middle row)
    { id: 'ee1', source: 'E1', target: 'E2', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    { id: 'ee4', source: 'E2', target: 'E4', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    { id: 'ee2', source: 'E4', target: 'E3', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    { id: 'ee3', source: 'E3', target: 'E5', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    { id: 'ee5', source: 'E5', target: 'E6', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    { id: 'ee6', source: 'E4', target: 'E7', type: 'WORKS_WITH', label: 'WORKS_WITH' },
    
    // KNOWS
    { id: 'ee7', source: 'E1', target: 'E3', type: 'KNOWS', label: 'KNOWS', curve: 'M 140 165 Q 320 120 500 165' },
    { id: 'ee8', source: 'E1', target: 'E5', type: 'KNOWS', label: 'KNOWS', curve: 'M 140 165 Q 380 95 620 165' },
    { id: 'ee9', source: 'E3', target: 'E6', type: 'KNOWS', label: 'KNOWS', curve: 'M 500 165 Q 600 215 700 240' },

    // ASSIGNED_TO (Vertical Upwards to Projects)
    { id: 'ee10', source: 'E1', target: 'T1', type: 'ASSIGNED_TO', label: 'CONTRIBUTES' },
    { id: 'ee11', source: 'E2', target: 'T2', type: 'ASSIGNED_TO', label: 'CONTRIBUTES' },
    { id: 'ee12', source: 'E3', target: 'T2', type: 'ASSIGNED_TO', label: 'CONTRIBUTES' },
    { id: 'ee14', source: 'E4', target: 'T2', type: 'ASSIGNED_TO', label: 'CONTRIBUTES' },
    { id: 'ee13', source: 'E5', target: 'T3', type: 'ASSIGNED_TO', label: 'CONTRIBUTES' },
    { id: 'ee15', source: 'E6', target: 'T3', type: 'ASSIGNED_TO', label: 'LEADS' },

    // HAS_SKILL (Vertical Downwards to Skills)
    { id: 'ee17', source: 'E1', target: 'S2', type: 'HAS_SKILL', label: 'SKILL' },
    { id: 'ee16', source: 'E1', target: 'S1', type: 'HAS_SKILL', label: 'SKILL' },
    { id: 'ee18', source: 'E2', target: 'S1', type: 'HAS_SKILL', label: 'SKILL' },
    { id: 'ee20', source: 'E4', target: 'S4', type: 'HAS_SKILL', label: 'SKILL' },
    { id: 'ee19', source: 'E3', target: 'S4', type: 'HAS_SKILL', label: 'SKILL' },
    { id: 'ee21', source: 'E7', target: 'S3', type: 'HAS_SKILL', label: 'SKILL' }
  ]
};

const PRESETS = [
  {
    id: 'preset1',
    name: '1. Multi-Hop Citation Lineage (Variable Depth *1..3)',
    domain: 'academic',
    query: `// Find all downstream citations stemming from P1 up to 3 hops away
MATCH path = (p:Paper {id: 'P1'})-[:CITES*1..3]->(cited:Paper)
RETURN p.label AS Source, length(path) AS HopDistance, cited.label AS CitedPaper, cited.venue AS Venue, cited.citations AS Citations
ORDER BY HopDistance, Citations DESC;`,
    description: 'Traverses recursive citation links starting from P1 across depth levels 1, 2, and 3.',
    targetNodes: ['P1', 'P2', 'P3', 'P4', 'P5', 'P7', 'P8'],
    targetEdges: ['e15', 'e16', 'e17', 'e18', 'e19', 'e20'],
    hops: [
      { step: 1, activeNodes: ['P1', 'P2', 'P5'], activeEdges: ['e15', 'e18'], label: 'Hop 1: Direct Citations from P1' },
      { step: 2, activeNodes: ['P2', 'P3', 'P5', 'P7'], activeEdges: ['e16', 'e19'], label: 'Hop 2: 2nd Degree Citations' },
      { step: 3, activeNodes: ['P3', 'P4', 'P7', 'P8'], activeEdges: ['e17', 'e20'], label: 'Hop 3: 3rd Degree Lineage Reached' }
    ],
    hiddenLinks: [],
    columns: ['Source', 'HopDistance', 'CitedPaper', 'Venue', 'Citations'],
    results: [
      { Source: 'P1: Graph Transformer', HopDistance: '1 Hop', CitedPaper: 'P2: Multi-Hop Reasoner', Venue: 'NeurIPS', Citations: 98 },
      { Source: 'P1: Graph Transformer', HopDistance: '1 Hop', CitedPaper: 'P5: KG Distillation', Venue: 'ICLR', Citations: 64 },
      { Source: 'P1: Graph Transformer', HopDistance: '2 Hops', CitedPaper: 'P3: Triadic Embeddings', Venue: 'KDD', Citations: 185 },
      { Source: 'P1: Graph Transformer', HopDistance: '2 Hops', CitedPaper: 'P7: Hyperbolic KG', Venue: 'ICLR', Citations: 156 },
      { Source: 'P1: Graph Transformer', HopDistance: '3 Hops', CitedPaper: 'P4: Relational GNNs', Venue: 'KDD', Citations: 210 },
      { Source: 'P1: Graph Transformer', HopDistance: '3 Hops', CitedPaper: 'P8: Inductive Link Pred', Venue: 'KDD', Citations: 245 }
    ]
  },
  {
    id: 'preset2',
    name: '2. Triadic Closure & Hidden Collaborator Discovery',
    domain: 'academic',
    query: `// Discover hidden collaborator opportunities through shared co-authors
MATCH (a1:Author)-[:COLLABORATED_WITH]-(a2:Author)-[:COLLABORATED_WITH]-(a3:Author)
WHERE NOT (a1)-[:COLLABORATED_WITH]-(a3) AND a1.id < a3.id
RETURN a1.label AS Researcher_A, a2.label AS BridgeAuthor, a3.label AS PotentialPartner, 'Hidden Triad Motif' AS PatternType;`,
    description: 'Finds pairs of authors who share a common co-author but have never co-authored together (open triads).',
    targetNodes: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    targetEdges: ['e25', 'e26', 'e27', 'e28', 'e29', 'e30', 'e31'],
    hops: [
      { step: 1, activeNodes: ['A1', 'A2', 'A3'], activeEdges: ['e25', 'e26'], label: 'Detecting 2-hop collaborator path: A1 - A2 - A3' },
      { step: 2, activeNodes: ['A2', 'A3', 'A5'], activeEdges: ['e26', 'e27'], label: 'Detecting 2-hop collaborator path: A2 - A3 - A5' },
      { step: 3, activeNodes: ['A3', 'A5', 'A8'], activeEdges: ['e27', 'e31'], label: 'Detecting 2-hop collaborator path: A3 - A5 - A8' }
    ],
    hiddenLinks: [
      { source: 'A1', target: 'A3', label: 'Hidden Triad Link (via A2)', reason: 'Shared Co-author: Dr. Beatrice Chen', curve: 'M 170 55 Q 290 20 410 55' },
      { source: 'A2', target: 'A5', label: 'Hidden Triad Link (via A3)', reason: 'Shared Co-author: Dr. Carlos Mendez', curve: 'M 290 55 Q 410 20 530 55' },
      { source: 'A3', target: 'A8', label: 'Hidden Triad Link (via A5)', reason: 'Shared Co-author: Dr. Elena Rostova', curve: 'M 410 55 Q 535 20 660 55' },
      { source: 'A1', target: 'A6', label: 'Hidden Triad Link (via A2)', reason: 'Shared Co-author: Dr. Beatrice Chen', curve: 'M 170 55 Q 160 160 230 240' }
    ],
    columns: ['Researcher_A', 'BridgeAuthor', 'PotentialPartner', 'AffinityScore', 'PatternType'],
    results: [
      { Researcher_A: 'Dr. Alex Vance (AI)', BridgeAuthor: 'Dr. Beatrice Chen (Graphs)', PotentialPartner: 'Dr. Carlos Mendez (NLP)', AffinityScore: '94% High', PatternType: 'Open Triadic Closure' },
      { Researcher_A: 'Dr. Beatrice Chen (Graphs)', BridgeAuthor: 'Dr. Carlos Mendez (NLP)', PotentialPartner: 'Dr. Elena Rostova (Bio)', AffinityScore: '81% High', PatternType: 'Open Triadic Closure' },
      { Researcher_A: 'Dr. Carlos Mendez (NLP)', BridgeAuthor: 'Dr. Elena Rostova (Bio)', PotentialPartner: 'Dr. Haruto Tanaka (Vision)', AffinityScore: '87% High', PatternType: 'Open Triadic Closure' },
      { Researcher_A: 'Dr. Alex Vance (AI)', BridgeAuthor: 'Dr. Beatrice Chen (Graphs)', PotentialPartner: 'Dr. Faisal Khan (Systems)', AffinityScore: '89% High', PatternType: 'Open Triadic Closure' }
    ]
  },
  {
    id: 'preset3',
    name: '3. Aggregation with WITH & COLLECT()',
    domain: 'academic',
    query: `// Compute author productivity and aggregate papers in collection
MATCH (a:Author)-[:AUTHORED]->(p:Paper)
WITH a, count(p) AS paperCount, collect(p.label) AS publishedPapers
WHERE paperCount >= 2
RETURN a.label AS AuthorName, a.domain AS Field, paperCount, publishedPapers
ORDER BY paperCount DESC;`,
    description: 'Projects authors with 2 or more publications and aggregates their titles into a collection list.',
    targetNodes: ['A1', 'A2', 'A3', 'A5', 'A6', 'A8', 'P1', 'P2', 'P3', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'],
    targetEdges: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e8', 'e9', 'e10', 'e11', 'e13', 'e14'],
    hops: [
      { step: 1, activeNodes: ['A1', 'P1', 'P2'], activeEdges: ['e1', 'e2'], label: 'Evaluating A1 (Alex Vance) -> 2 Papers' },
      { step: 2, activeNodes: ['A2', 'P3', 'P6'], activeEdges: ['e3', 'e4'], label: 'Evaluating A2 (Beatrice Chen) -> 2 Papers' },
      { step: 3, activeNodes: ['A6', 'P10', 'P11'], activeEdges: ['e10', 'e11'], label: 'Evaluating A6 (Faisal Khan) -> 2 Papers' }
    ],
    hiddenLinks: [],
    columns: ['AuthorName', 'Field', 'paperCount', 'publishedPapers'],
    results: [
      { AuthorName: 'Dr. Alex Vance', Field: 'AI / Deep Learning', paperCount: 2, publishedPapers: '["P1: Graph Transformer", "P2: Multi-Hop Reasoners"]' },
      { AuthorName: 'Dr. Beatrice Chen', Field: 'Graph Theory', paperCount: 2, publishedPapers: '["P3: Triadic Embeddings", "P6: Subgraph Mining"]' },
      { AuthorName: 'Dr. Carlos Mendez', Field: 'NLP & KG', paperCount: 2, publishedPapers: '["P2: Multi-Hop Reasoners", "P5: KG Distillation"]' },
      { AuthorName: 'Dr. Elena Rostova', Field: 'Comp Biology', paperCount: 2, publishedPapers: '["P7: Hyperbolic KG", "P8: Inductive Link Pred"]' },
      { AuthorName: 'Dr. Faisal Khan', Field: 'Graph Engines', paperCount: 2, publishedPapers: '["P10: Distributed Traversal", "P11: Vectorized Cypher"]' },
      { AuthorName: 'Dr. Haruto Tanaka', Field: 'Computer Vision', paperCount: 2, publishedPapers: '["P9: Neural Visual Graph", "P12: Cross-modal Citation"]' }
    ]
  },
  {
    id: 'preset4',
    name: '4. Shortest Path Interdisciplinary Bridge',
    domain: 'academic',
    query: `// Find the optimal shortest path bridge between Robotics (A4) and Vision (A8)
MATCH p = shortestPath((start:Author {id:'A4'})-[*]-(target:Author {id:'A8'}))
RETURN [n IN nodes(p) | n.label] AS BridgePath, length(p) AS PathHops;`,
    description: 'Calculates the shortest collaborative bridge between Dr. Diana Patel (A4) and Dr. Haruto Tanaka (A8).',
    targetNodes: ['A4', 'A1', 'A2', 'A3', 'A5', 'A8'],
    targetEdges: ['e28', 'e25', 'e26', 'e27', 'e31'],
    hops: [
      { step: 1, activeNodes: ['A4', 'A1'], activeEdges: ['e28'], label: 'Hop 1: A4 -> A1 (Vance)' },
      { step: 2, activeNodes: ['A1', 'A2'], activeEdges: ['e25'], label: 'Hop 2: A1 -> A2 (Chen)' },
      { step: 3, activeNodes: ['A2', 'A3'], activeEdges: ['e26'], label: 'Hop 3: A2 -> A3 (Mendez)' },
      { step: 4, activeNodes: ['A3', 'A5'], activeEdges: ['e27'], label: 'Hop 4: A3 -> A5 (Rostova)' },
      { step: 5, activeNodes: ['A5', 'A8'], activeEdges: ['e31'], label: 'Hop 5: A5 -> A8 (Tanaka Destination Reached!)' }
    ],
    hiddenLinks: [],
    columns: ['StartEntity', 'TargetEntity', 'HopDistance', 'BridgePathSequence'],
    results: [
      { StartEntity: 'Dr. Diana Patel (A4)', TargetEntity: 'Dr. Haruto Tanaka (A8)', HopDistance: '5 Hops', BridgePathSequence: 'A4 (Robotics) ➔ A1 (AI) ➔ A2 (Graphs) ➔ A3 (NLP) ➔ A5 (Bio) ➔ A8 (Vision)' }
    ]
  },
  {
    id: 'preset5',
    name: '5. Enterprise Cross-Department Skill Paths & Hidden Intro Links',
    domain: 'enterprise',
    query: `// Discover multi-hop connection from ML Engineer (Alice) to Director (Frank)
MATCH path = (e:Person {id:'E1'})-[:WORKS_WITH*1..3]-(target:Person {id:'E6'})
RETURN path, [n IN nodes(path) | n.label] AS ChainOfWork;`,
    description: 'Discovers organizational collaboration chain and hidden introduction paths between Alice and Frank.',
    targetNodes: ['E1', 'E2', 'E4', 'E3', 'E5', 'E6'],
    targetEdges: ['ee1', 'ee4', 'ee2', 'ee3', 'ee5'],
    hops: [
      { step: 1, activeNodes: ['E1', 'E2'], activeEdges: ['ee1'], label: 'Hop 1: Alice (ML) -> Bob (Backend)' },
      { step: 2, activeNodes: ['E2', 'E4'], activeEdges: ['ee4'], label: 'Hop 2: Bob -> David (SRE)' },
      { step: 3, activeNodes: ['E4', 'E3', 'E5'], activeEdges: ['ee2', 'ee3'], label: 'Hop 3: David -> Carol -> Eve (Data/NLP)' },
      { step: 4, activeNodes: ['E5', 'E6'], activeEdges: ['ee5'], label: 'Hop 4: Eve -> Frank (Director Reached!)' }
    ],
    hiddenLinks: [
      { source: 'E1', target: 'E6', label: 'Hidden Exec Intro Path', reason: 'Common contacts: Carol White & Eve Brown', curve: 'M 140 165 Q 420 320 700 240' }
    ],
    columns: ['Initiator', 'Target', 'HopDistance', 'ChainOfWork', 'DepartmentSequence'],
    results: [
      { Initiator: 'Alice Smith (ML Eng)', Target: 'Frank Garcia (Director)', HopDistance: '4 Hops', ChainOfWork: 'Alice ➔ Bob ➔ David ➔ Carol ➔ Eve ➔ Frank', DepartmentSequence: 'AI Research ➔ Core Infra ➔ Data Systems ➔ AI Research ➔ Leadership' }
    ]
  }
];

// -------------------------------------------------------------
// Dynamic openCypher Query Parsing & Execution Engine
// -------------------------------------------------------------
function extractReturnColumns(returnClause, sampleRow) {
  if (!returnClause || returnClause.trim() === '*' || returnClause.trim() === '') {
    return sampleRow ? Object.keys(sampleRow) : ['Result'];
  }
  const cleanReturn = returnClause.replace(/;+\s*$/, '');
  const parts = cleanReturn.split(',').map(p => p.trim()).filter(Boolean);
  const cols = parts.map(part => {
    const asMatch = part.match(/\s+AS\s+([a-zA-Z0-9_]+)/i);
    if (asMatch) return asMatch[1];
    const dotMatch = part.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
    if (dotMatch) return dotMatch[2];
    const cleanCol = part.replace(/[^a-zA-Z0-9_]/g, '');
    return cleanCol || 'Column';
  }).filter(Boolean);
  return cols.length > 0 ? cols : (sampleRow ? Object.keys(sampleRow) : ['Result']);
}

function projectReturnRow(returnClause, aliases, context = {}) {
  const row = {};
  if (!returnClause || returnClause.trim() === '*' || returnClause.trim() === '') {
    Object.entries(aliases).forEach(([k, v]) => {
      if (v && v.label) {
        row[k] = v.label;
      }
    });
    return Object.keys(row).length > 0 ? row : { Match: 'Found' };
  }

  const cleanReturn = returnClause.replace(/;+\s*$/, '');
  const parts = cleanReturn.split(',').map(p => p.trim()).filter(Boolean);

  parts.forEach(part => {
    const asMatch = part.match(/(.+?)\s+AS\s+([a-zA-Z0-9_]+)/i);
    const expr = asMatch ? asMatch[1].trim() : part;
    const colName = asMatch ? asMatch[2].trim() : expr.replace(/^[a-zA-Z0-9_]+\./, '');

    // String literal e.g. 'Hidden Triad Motif'
    const strLiteral = expr.match(/^['"]([^'"]+)['"]$/);
    if (strLiteral) {
      row[colName] = strLiteral[1];
      return;
    }

    // Number literal
    if (/^\d+(\.\d+)?$/.test(expr)) {
      row[colName] = Number(expr);
      return;
    }

    // length(path)
    if (/length\(/i.test(expr)) {
      row[colName] = context.hopCount ? `${context.hopCount} Hop${context.hopCount > 1 ? 's' : ''}` : '1 Hop';
      return;
    }

    // nodes(path) or [n IN nodes(p) | n.label]
    if (/nodes\(/i.test(expr)) {
      if (context.pathNodes) {
        row[colName] = context.pathNodes.map(n => n.label).join(' ➔ ');
        return;
      }
    }

    // Property access e.g. p1.label, p2.citations, a.hIndex
    const propMatch = expr.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
    if (propMatch) {
      const varName = propMatch[1];
      const prop = propMatch[2];
      const obj = aliases[varName] || aliases[varName.toLowerCase()];
      if (obj && obj[prop] !== undefined) {
        row[colName] = obj[prop];
      } else {
        row[colName] = '-';
      }
      return;
    }

    // Direct object variable e.g. p1, p2, r, a, p
    const obj = aliases[expr] || aliases[expr.toLowerCase()];
    if (obj) {
      if (typeof obj === 'object') {
        row[colName] = obj.label || obj.name || obj.type || obj.id || JSON.stringify(obj);
      } else {
        row[colName] = obj;
      }
      return;
    }

    row[colName] = expr;
  });

  return row;
}

function handleAggregation(rawRows, returnClause, withClause) {
  const groups = new Map();
  rawRows.forEach(row => {
    const key = row[Object.keys(row)[0]] || JSON.stringify(row);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  });

  const aggRows = [];
  groups.forEach((rows) => {
    const count = rows.length;
    const firstRow = rows[0];
    const item = { ...firstRow };
    if (returnClause.toLowerCase().includes('count(') || withClause?.toLowerCase().includes('count(')) {
      item.paperCount = count;
      item.count = count;
    }
    if (returnClause.toLowerCase().includes('collect(') || withClause?.toLowerCase().includes('collect(')) {
      const colValues = rows.map(r => r[Object.keys(r)[1]] || Object.values(r)[1]).filter(Boolean);
      item.publishedPapers = JSON.stringify(colValues);
      item.collected = JSON.stringify(colValues);
    }
    aggRows.push(item);
  });

  const columns = extractReturnColumns(returnClause, aggRows[0]);
  return { columns, results: aggRows };
}

function applySortingAndLimit(rows, orderByClause, limitVal) {
  let result = [...rows];
  if (orderByClause) {
    const isDesc = /DESC/i.test(orderByClause);
    const colMatch = orderByClause.replace(/DESC|ASC/gi, '').trim().split(',')[0].trim();
    const cleanCol = colMatch.replace(/^[a-zA-Z0-9_]+\./, '');
    result.sort((a, b) => {
      const valA = a[cleanCol] !== undefined ? a[cleanCol] : 0;
      const valB = b[cleanCol] !== undefined ? b[cleanCol] : 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }
      return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
    });
  }
  if (limitVal && limitVal > 0) {
    result = result.slice(0, limitVal);
  }
  return result;
}

function executeCypherQuery(queryStr, graph, presets = []) {
  const clean = (str) => str.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const cleanedQuery = clean(queryStr);

  if (!cleanedQuery) {
    return {
      columns: ['Status', 'Message'],
      results: [{ Status: 'Empty Query', Message: 'Please enter an openCypher query to execute.' }],
      targetNodes: [],
      targetEdges: [],
      hops: [],
      hiddenLinks: [],
      error: null
    };
  }

  // 1. Check exact or whitespace-normalized match with Presets
  const normalize = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const matchedPreset = presets.find(p => {
    return normalize(clean(p.query)) === normalize(cleanedQuery);
  });
  if (matchedPreset) {
    return {
      columns: matchedPreset.columns,
      results: matchedPreset.results,
      targetNodes: matchedPreset.targetNodes || [],
      targetEdges: matchedPreset.targetEdges || [],
      hops: matchedPreset.hops || [],
      hiddenLinks: matchedPreset.hiddenLinks || [],
      error: null
    };
  }

  try {
    const matchRegex = /MATCH\s+(.+?)(?=\s+WHERE|\s+WITH|\s+RETURN|$)/i;
    const whereRegex = /WHERE\s+(.+?)(?=\s+WITH|\s+RETURN|\s+ORDER|\s+LIMIT|$)/i;
    const withRegex = /WITH\s+(.+?)(?=\s+WHERE|\s+RETURN|\s+ORDER|\s+LIMIT|$)/i;
    const returnRegex = /RETURN\s+(.+?)(?=\s+ORDER|\s+LIMIT|;|$)/i;
    const orderByRegex = /ORDER\s+BY\s+(.+?)(?=\s+LIMIT|;|$)/i;
    const limitRegex = /LIMIT\s+(\d+)/i;

    const matchMatch = cleanedQuery.match(matchRegex);
    const returnMatch = cleanedQuery.match(returnRegex);

    if (!matchMatch) {
      return {
        columns: ['Status', 'Message'],
        results: [{ Status: 'Syntax Notice', Message: 'Expected MATCH clause. Example: MATCH (n:Author) RETURN n.label, n.hIndex' }],
        targetNodes: [],
        targetEdges: [],
        hops: [],
        hiddenLinks: [],
        error: null
      };
    }

    let matchClause = matchMatch[1].trim();
    const returnClause = returnMatch ? returnMatch[1].trim() : '*';
    const whereMatch = cleanedQuery.match(whereRegex);
    const whereClause = whereMatch ? whereMatch[1].trim() : null;
    const withMatch = cleanedQuery.match(withRegex);
    const withClause = withMatch ? withMatch[1].trim() : null;
    const orderByMatch = cleanedQuery.match(orderByRegex);
    const orderByClause = orderByMatch ? orderByMatch[1].trim() : null;
    const limitMatch = cleanedQuery.match(limitRegex);
    const limitVal = limitMatch ? parseInt(limitMatch[1], 10) : null;

    // Strip leading path variable assignments like "path = ..."
    matchClause = matchClause.replace(/^[a-zA-Z0-9_]+\s*=\s*/i, '').trim();

    const evaluateCondition = (nodeOrPair, conditionStr, aliases = {}) => {
      if (!conditionStr) return true;
      if (conditionStr.toUpperCase().includes('NOT') && conditionStr.includes('-[')) {
        return true; 
      }
      
      const evalStr = conditionStr.replace(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g, (m, varName, propName) => {
        const obj = aliases[varName] || aliases[varName.toLowerCase()] || (nodeOrPair.id ? nodeOrPair : null);
        if (obj && obj[propName] !== undefined) {
          const val = obj[propName];
          return typeof val === 'string' ? JSON.stringify(val) : val;
        }
        return 'null';
      }).replace(/<>/g, '!==').replace(/=(?!=)/g, '===').replace(/AND/gi, '&&').replace(/OR/gi, '||');

      try {
        const fn = new Function(...Object.keys(aliases), `return Boolean(${evalStr});`);
        return fn(...Object.values(aliases));
      } catch {
        return true;
      }
    };

    // Case A: ShortestPath query
    if (/shortestPath/i.test(matchClause)) {
      const allIds = [...matchClause.matchAll(/id\s*:\s*['"]([^'"]+)['"]/gi)].map(m => m[1]);
      const startId = allIds[0] || (graph.id === 'academic' ? 'A4' : 'E1');
      const targetId = allIds[1] || (graph.id === 'academic' ? 'A8' : 'E6');

      const queue = [[startId]];
      const visited = new Set([startId]);
      let foundPath = null;

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];
        if (curr === targetId) {
          foundPath = path;
          break;
        }
        const neighbors = [];
        graph.edges.forEach(e => {
          if (e.source === curr && !visited.has(e.target)) {
            neighbors.push(e.target);
          } else if (e.target === curr && !visited.has(e.source)) {
            neighbors.push(e.source);
          }
        });
        for (const nxt of neighbors) {
          visited.add(nxt);
          queue.push([...path, nxt]);
        }
      }

      if (foundPath) {
        const pathNodes = foundPath.map(nid => graph.nodes.find(n => n.id === nid)).filter(Boolean);
        const pathEdges = [];
        const hops = [];
        for (let i = 0; i < foundPath.length - 1; i++) {
          const u = foundPath[i];
          const v = foundPath[i + 1];
          const edge = graph.edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
          if (edge) pathEdges.push(edge.id);
          hops.push({
            step: i + 1,
            activeNodes: [u, v],
            activeEdges: edge ? [edge.id] : [],
            label: `Hop ${i + 1}: ${pathNodes[i]?.label} ➔ ${pathNodes[i + 1]?.label}`
          });
        }

        const startNode = pathNodes[0];
        const targetNode = pathNodes[pathNodes.length - 1];
        const bridgeStr = pathNodes.map(n => n.label).join(' ➔ ');

        return {
          columns: ['StartEntity', 'TargetEntity', 'HopDistance', 'BridgePathSequence'],
          results: [{
            StartEntity: `${startNode?.label} (${startNode?.id})`,
            TargetEntity: `${targetNode?.label} (${targetNode?.id})`,
            HopDistance: `${foundPath.length - 1} Hops`,
            BridgePathSequence: bridgeStr
          }],
          targetNodes: foundPath,
          targetEdges: pathEdges,
          hops,
          hiddenLinks: [],
          error: null
        };
      }
    }

    // Case B & D: Universal 2-Node 1-Edge / Multi-Hop Matcher
    // Supports:
    // (p1:Paper) - [r:Cites] -> [p2:Paper]
    // (p1:Paper)-[:CITES*1..3]->(p2:Paper)
    // [a:Author] - [:AUTHORED] -> [p:Paper]
    // (a) - [r] -> (b)
    // (a) --> (b)
    // (a) - (b)
    const relRegex = /[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?(?:\s*\{([^}]+)\})?\s*[\)\]]\s*(<)?\s*-\s*(?:\[\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?(?:\s*\*(\d+)?(?:\.\.(\d+)?)?)?\s*(?:\{[^}]*\})?\s*\])?\s*-\s*(>)?\s*[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?(?:\s*\{([^}]+)\})?\s*[\)\]]/i;
    const relMatch = matchClause.match(relRegex);

    if (relMatch) {
      const srcVar = relMatch[1] || 'p1';
      const srcType = relMatch[2];
      const srcProps = relMatch[3];
      const leftArrow = relMatch[4];
      const relVar = relMatch[5] || 'r';
      const relType = relMatch[6];
      const minHop = relMatch[7] ? parseInt(relMatch[7], 10) : (relMatch[8] ? 1 : null);
      const maxHop = relMatch[8] ? parseInt(relMatch[8], 10) : null;
      const rightArrow = relMatch[9];
      const tgtVar = relMatch[10] || 'p2';
      const tgtType = relMatch[11];
      const tgtProps = relMatch[12];

      const isDirected = (rightArrow === '>' && !leftArrow) ? 'forward' : (leftArrow === '<' && !rightArrow) ? 'backward' : 'undirected';

      let startId = null;
      if (srcProps) {
        const idM = srcProps.match(/id\s*:\s*['"]([^'"]+)['"]/i);
        if (idM) startId = idM[1];
      }
      let targetId = null;
      if (tgtProps) {
        const idM = tgtProps.match(/id\s*:\s*['"]([^'"]+)['"]/i);
        if (idM) targetId = idM[1];
      }

      // If variable-length path expansion (*1..k or *)
      if (minHop !== null || maxHop !== null) {
        const actualMinHop = minHop || 1;
        const actualMaxHop = maxHop || 3;

        const startCandidates = graph.nodes.filter(n => {
          if (startId && n.id !== startId) return false;
          if (srcType && n.type.toLowerCase() !== srcType.toLowerCase()) return false;
          return true;
        });

        const matchedRows = [];
        const allTargetNodes = new Set();
        const allTargetEdges = new Set();
        const hopSteps = [];

        for (const startNode of startCandidates) {
          allTargetNodes.add(startNode.id);
          const queue = [{ node: startNode, depth: 0, path: [startNode], edgePath: [] }];

          while (queue.length > 0) {
            const { node: curr, depth, path, edgePath } = queue.shift();
            if (depth >= actualMaxHop) continue;

            const candidateEdges = graph.edges.filter(e => {
              if (relType && e.type.toLowerCase() !== relType.toLowerCase()) return false;
              if (isDirected === 'forward') return e.source === curr.id;
              if (isDirected === 'backward') return e.target === curr.id;
              return e.source === curr.id || e.target === curr.id;
            });

            for (const edge of candidateEdges) {
              const nextId = edge.source === curr.id ? edge.target : edge.source;
              if (path.some(p => p.id === nextId)) continue;
              const nextNode = graph.nodes.find(n => n.id === nextId);
              if (!nextNode) continue;

              const nextDepth = depth + 1;
              const newPath = [...path, nextNode];
              const newEdgePath = [...edgePath, edge.id];

              allTargetNodes.add(nextNode.id);
              allTargetEdges.add(edge.id);

              if (nextDepth >= actualMinHop && (!targetId || nextNode.id === targetId) && (!tgtType || nextNode.type.toLowerCase() === tgtType.toLowerCase())) {
                const aliases = {
                  [srcVar]: startNode,
                  [srcVar.toLowerCase()]: startNode,
                  [tgtVar]: nextNode,
                  [tgtVar.toLowerCase()]: nextNode,
                  [relVar]: edge,
                  [relVar.toLowerCase()]: edge
                };

                const row = projectReturnRow(returnClause, aliases, { pathNodes: newPath, hopCount: nextDepth, edge });
                // Fallback default properties if returnClause was general
                if (!returnClause || returnClause === '*') {
                  row.Source = startNode.label;
                  row.HopDistance = `${nextDepth} Hop${nextDepth > 1 ? 's' : ''}`;
                  row.Target = nextNode.label;
                  row.ChainOfWork = newPath.map(p => p.label).join(' ➔ ');
                }
                matchedRows.push(row);

                if (hopSteps.length < 5) {
                  hopSteps.push({
                    step: hopSteps.length + 1,
                    activeNodes: [curr.id, nextNode.id],
                    activeEdges: [edge.id],
                    label: `Hop ${nextDepth}: ${curr.label} ➔ ${nextNode.label}`
                  });
                }
              }

              queue.push({ node: nextNode, depth: nextDepth, path: newPath, edgePath: newEdgePath });
            }
          }
        }

        const cols = extractReturnColumns(returnClause, matchedRows[0]);
        const sortedRows = applySortingAndLimit(matchedRows, orderByClause, limitVal);

        return {
          columns: cols,
          results: sortedRows,
          targetNodes: Array.from(allTargetNodes),
          targetEdges: Array.from(allTargetEdges),
          hops: hopSteps,
          hiddenLinks: [],
          error: null
        };
      }

      // Single-hop relationship match (directed or undirected)
      const targetNodes = new Set();
      const targetEdges = new Set();
      const matchedRows = [];
      const hops = [];

      for (const edge of graph.edges) {
        if (relType && edge.type.toLowerCase() !== relType.toLowerCase()) continue;

        let srcCandidates = [];
        if (isDirected === 'forward') {
          srcCandidates.push({ src: graph.nodes.find(n => n.id === edge.source), tgt: graph.nodes.find(n => n.id === edge.target) });
        } else if (isDirected === 'backward') {
          srcCandidates.push({ src: graph.nodes.find(n => n.id === edge.target), tgt: graph.nodes.find(n => n.id === edge.source) });
        } else {
          srcCandidates.push({ src: graph.nodes.find(n => n.id === edge.source), tgt: graph.nodes.find(n => n.id === edge.target) });
          srcCandidates.push({ src: graph.nodes.find(n => n.id === edge.target), tgt: graph.nodes.find(n => n.id === edge.source) });
        }

        for (const { src, tgt } of srcCandidates) {
          if (!src || !tgt) continue;
          if (srcType && src.type.toLowerCase() !== srcType.toLowerCase()) continue;
          if (tgtType && tgt.type.toLowerCase() !== tgtType.toLowerCase()) continue;
          if (startId && src.id !== startId) continue;
          if (targetId && tgt.id !== targetId) continue;

          const aliases = {
            [srcVar]: src,
            [srcVar.toLowerCase()]: src,
            [tgtVar]: tgt,
            [tgtVar.toLowerCase()]: tgt,
            [relVar]: edge,
            [relVar.toLowerCase()]: edge
          };

          if (whereClause && !evaluateCondition(src, whereClause, aliases)) continue;

          targetNodes.add(src.id);
          targetNodes.add(tgt.id);
          targetEdges.add(edge.id);

          const row = projectReturnRow(returnClause, aliases, { edge, relVar });
          matchedRows.push(row);

          if (hops.length < 6) {
            hops.push({
              step: hops.length + 1,
              activeNodes: [src.id, tgt.id],
              activeEdges: [edge.id],
              label: `${src.label} ➔ ${tgt.label}`
            });
          }
        }
      }

      if (withClause || returnClause.toLowerCase().includes('count(') || returnClause.toLowerCase().includes('collect(')) {
        const aggregated = handleAggregation(matchedRows, returnClause, withClause);
        return {
          columns: aggregated.columns,
          results: aggregated.results,
          targetNodes: Array.from(targetNodes),
          targetEdges: Array.from(targetEdges),
          hops,
          hiddenLinks: [],
          error: null
        };
      }

      const columns = extractReturnColumns(returnClause, matchedRows[0]);
      const sortedRows = applySortingAndLimit(matchedRows, orderByClause, limitVal);

      return {
        columns: columns.length > 0 ? columns : Object.keys(matchedRows[0] || { Match: 'None' }),
        results: sortedRows,
        targetNodes: Array.from(targetNodes),
        targetEdges: Array.from(targetEdges),
        hops,
        hiddenLinks: [],
        error: null
      };
    }

    // Case C: Triadic Closure / 2-hop motif pattern
    // (a1:Author)-[:COLLABORATED_WITH]-(a2:Author)-[:COLLABORATED_WITH]-(a3:Author)
    const triadRegex = /[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?\s*[\)\]]\s*-\s*\[:?([a-zA-Z0-9_]*)\]\s*-\s*[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?\s*[\)\]]\s*-\s*\[:?([a-zA-Z0-9_]*)\]\s*-\s*[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?\s*[\)\]]/i;
    const triadMatch = matchClause.match(triadRegex);
    if (triadMatch) {
      const type1 = triadMatch[2] || '';
      const type2 = triadMatch[5] || '';
      const type3 = triadMatch[8] || '';
      const rel1 = triadMatch[3] || '';
      const rel2 = triadMatch[6] || '';

      const matchedRows = [];
      const targetNodes = new Set();
      const targetEdges = new Set();
      const hiddenLinks = [];
      const hops = [];

      const authors = graph.nodes.filter(n => !type1 || n.type.toLowerCase() === type1.toLowerCase());

      authors.forEach(a1 => {
        const a1Edges = graph.edges.filter(e => (!rel1 || e.type.toLowerCase() === rel1.toLowerCase()) && (e.source === a1.id || e.target === a1.id));
        a1Edges.forEach(e1 => {
          const a2Id = e1.source === a1.id ? e1.target : e1.source;
          const a2 = graph.nodes.find(n => n.id === a2Id);
          if (!a2 || (type2 && a2.type.toLowerCase() !== type2.toLowerCase())) return;

          const a2Edges = graph.edges.filter(e => (!rel2 || e.type.toLowerCase() === rel2.toLowerCase()) && (e.source === a2.id || e.target === a2.id) && e.id !== e1.id);
          a2Edges.forEach(e2 => {
            const a3Id = e2.source === a2.id ? e2.target : e2.source;
            if (a3Id === a1.id || a1.id >= a3Id) return;
            const a3 = graph.nodes.find(n => n.id === a3Id);
            if (!a3 || (type3 && a3.type.toLowerCase() !== type3.toLowerCase())) return;

            const directLink = graph.edges.find(e => (e.source === a1.id && e.target === a3.id) || (e.source === a3.id && e.target === a1.id));
            if (!directLink) {
              targetNodes.add(a1.id);
              targetNodes.add(a2.id);
              targetNodes.add(a3.id);
              targetEdges.add(e1.id);
              targetEdges.add(e2.id);

              matchedRows.push({
                Researcher_A: `${a1.label} (${a1.domain || a1.dept || a1.id})`,
                BridgeAuthor: `${a2.label} (${a2.domain || a2.dept || a2.id})`,
                PotentialPartner: `${a3.label} (${a3.domain || a3.dept || a3.id})`,
                AffinityScore: `${Math.round(75 + (a1.hIndex || 20) % 20)}% High`,
                PatternType: 'Open Triadic Closure'
              });

              hiddenLinks.push({
                source: a1.id,
                target: a3.id,
                label: `Hidden Triad Link (via ${a2.id})`,
                reason: `Shared contact: ${a2.label}`
              });

              if (hops.length < 5) {
                hops.push({
                  step: hops.length + 1,
                  activeNodes: [a1.id, a2.id, a3.id],
                  activeEdges: [e1.id, e2.id],
                  label: `Triad ${hops.length + 1}: ${a1.label} ➔ ${a2.label} ➔ ${a3.label}`
                });
              }
            }
          });
        });
      });

      const cols = extractReturnColumns(returnClause, matchedRows[0]) || ['Researcher_A', 'BridgeAuthor', 'PotentialPartner', 'AffinityScore', 'PatternType'];
      return {
        columns: cols,
        results: matchedRows,
        targetNodes: Array.from(targetNodes),
        targetEdges: Array.from(targetEdges),
        hops,
        hiddenLinks,
        error: null
      };
    }

    // Case E: Single Node Scans MATCH (n:Type) or MATCH (n)
    const singleNodeMatch = matchClause.match(/[\(\[]\s*([a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z0-9_]+))?(?:\s*\{([^}]+)\})?\s*[\)\]]/i);
    if (singleNodeMatch) {
      const varName = singleNodeMatch[1] || 'n';
      const nodeType = singleNodeMatch[2];

      const matchingNodes = graph.nodes.filter(n => {
        if (nodeType && n.type.toLowerCase() !== nodeType.toLowerCase()) return false;
        const aliases = { [varName]: n, [varName.toLowerCase()]: n, n };
        if (whereClause && !evaluateCondition(n, whereClause, aliases)) return false;
        return true;
      });

      const targetNodes = matchingNodes.map(n => n.id);
      const matchedRows = matchingNodes.map(n => {
        const aliases = { [varName]: n, [varName.toLowerCase()]: n, n };
        return projectReturnRow(returnClause, aliases);
      });

      const columns = extractReturnColumns(returnClause, matchedRows[0]);
      const sortedRows = applySortingAndLimit(matchedRows, orderByClause, limitVal);

      const hops = matchingNodes.slice(0, 6).map((node, i) => ({
        step: i + 1,
        activeNodes: [node.id],
        activeEdges: [],
        label: `Matched ${node.type}: ${node.label}`
      }));

      return {
        columns: columns.length > 0 ? columns : Object.keys(matchedRows[0] || { Label: '', Type: '' }),
        results: sortedRows,
        targetNodes,
        targetEdges: [],
        hops,
        hiddenLinks: [],
        error: null
      };
    }

    // Fallback if no specific pattern matched
    return {
      columns: ['Result', 'Status'],
      results: [{ Result: 'Pattern Evaluated', Status: '0 matches found for pattern against current graph' }],
      targetNodes: [],
      targetEdges: [],
      hops: [],
      hiddenLinks: [],
      error: null
    };

  } catch (err) {
    return {
      columns: ['Error', 'Message'],
      results: [{ Error: 'Execution Error', Message: err.message || 'Unable to execute Cypher query.' }],
      targetNodes: [],
      targetEdges: [],
      hops: [],
      hiddenLinks: [],
      error: err.message
    };
  }
}

export default function LabSection() {
  const [selectedDomain, setSelectedDomain] = useState('academic');
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customQuery, setCustomQuery] = useState(PRESETS[0].query);
  
  // Dynamic Query Execution & Traversal States
  const [queryResults, setQueryResults] = useState(PRESETS[0].results);
  const [queryColumns, setQueryColumns] = useState(PRESETS[0].columns);
  const [activeTargetNodes, setActiveTargetNodes] = useState(PRESETS[0].targetNodes || []);
  const [activeTargetEdges, setActiveTargetEdges] = useState(PRESETS[0].targetEdges || []);
  const [activeHops, setActiveHops] = useState(PRESETS[0].hops || []);
  const [activeHiddenLinks, setActiveHiddenLinks] = useState(PRESETS[0].hiddenLinks || []);
  const [queryError, setQueryError] = useState(null);

  // Animation & Execution States
  const [animationSpeed, setAnimationSpeed] = useState(1.0); // 0.5x to 3.0x
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHopIndex, setCurrentHopIndex] = useState(-1);
  const [nodeFilter, setNodeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showHiddenLinks, setShowHiddenLinks] = useState(true);
  
  // Results view mode: 'table' or 'json'
  const [resultsViewMode, setResultsViewMode] = useState('table');
  const [copied, setCopied] = useState(false);

  // Execution Output & Metrics
  const [execStatus, setExecStatus] = useState('idle');
  const [metrics, setMetrics] = useState({
    latencyMs: 1.42,
    nodesTraversed: 7,
    edgesTraversed: 6,
    matchedPathsCount: 6,
    memoryKb: 42
  });

  // Active dataset
  const currentGraph = useMemo(() => {
    return selectedDomain === 'academic' ? ACADEMIC_GRAPH : ENTERPRISE_GRAPH;
  }, [selectedDomain]);

  // Handle Domain Switch
  const handleDomainChange = (domainKey) => {
    setSelectedDomain(domainKey);
    setIsPlaying(false);
    setCurrentHopIndex(-1);
    setSelectedNode(null);
    const matchingPreset = PRESETS.find(p => p.domain === domainKey) || PRESETS[0];
    setSelectedPreset(matchingPreset);
    setCustomQuery(matchingPreset.query);
    setQueryResults(matchingPreset.results);
    setQueryColumns(matchingPreset.columns);
    setActiveTargetNodes(matchingPreset.targetNodes || []);
    setActiveTargetEdges(matchingPreset.targetEdges || []);
    setActiveHops(matchingPreset.hops || []);
    setActiveHiddenLinks(matchingPreset.hiddenLinks || []);
    setQueryError(null);
    setExecStatus('completed');
    setMetrics({
      latencyMs: 1.25,
      nodesTraversed: matchingPreset.targetNodes?.length || 0,
      edgesTraversed: matchingPreset.targetEdges?.length || 0,
      matchedPathsCount: matchingPreset.results?.length || 0,
      memoryKb: 38
    });
  };

  // Handle Preset Select
  const handleSelectPreset = (preset) => {
    if (preset.domain !== selectedDomain) {
      setSelectedDomain(preset.domain);
    }
    setSelectedPreset(preset);
    setCustomQuery(preset.query);
    setQueryResults(preset.results);
    setQueryColumns(preset.columns);
    setActiveTargetNodes(preset.targetNodes || []);
    setActiveTargetEdges(preset.targetEdges || []);
    setActiveHops(preset.hops || []);
    setActiveHiddenLinks(preset.hiddenLinks || []);
    setQueryError(null);
    setIsPlaying(false);
    setCurrentHopIndex(-1);
    setSelectedNode(null);
    setExecStatus('completed');
    setMetrics({
      latencyMs: (1.1 + Math.random() * 0.7).toFixed(2),
      nodesTraversed: preset.targetNodes?.length || 0,
      edgesTraversed: preset.targetEdges?.length || 0,
      matchedPathsCount: preset.results?.length || 0,
      memoryKb: Math.round(30 + Math.random() * 20)
    });
  };

  // Traversal Timer Loop
  useEffect(() => {
    let timer;
    if (isPlaying && activeHops && activeHops.length > 0) {
      const stepDuration = Math.max(300, Math.round(1800 / animationSpeed));
      timer = setTimeout(() => {
        if (currentHopIndex < activeHops.length - 1) {
          setCurrentHopIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setExecStatus('completed');
        }
      }, stepDuration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentHopIndex, animationSpeed, activeHops]);

  // Play / Pause / Step Controls
  const handlePlay = () => {
    if (currentHopIndex >= (activeHops?.length || 0) - 1) {
      setCurrentHopIndex(0);
    } else if (currentHopIndex === -1) {
      setCurrentHopIndex(0);
    }
    setIsPlaying(true);
    setExecStatus('running');
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentHopIndex(-1);
    setSelectedNode(null);
    setExecStatus('idle');
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentHopIndex < (activeHops?.length || 0) - 1) {
      setCurrentHopIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentHopIndex > 0) {
      setCurrentHopIndex(prev => prev - 1);
    } else {
      setCurrentHopIndex(-1);
    }
  };

  // Execute Query dynamically
  const handleExecuteQuery = () => {
    setExecStatus('running');
    setIsPlaying(false);
    setCurrentHopIndex(-1);
    
    const startT = performance.now();
    const res = executeCypherQuery(customQuery, currentGraph, PRESETS);
    const elapsed = (performance.now() - startT + 0.8 + Math.random() * 0.9).toFixed(2);

    setQueryResults(res.results);
    setQueryColumns(res.columns);
    setActiveTargetNodes(res.targetNodes);
    setActiveTargetEdges(res.targetEdges);
    setActiveHops(res.hops);
    setActiveHiddenLinks(res.hiddenLinks);
    setQueryError(res.error);

    setMetrics({
      latencyMs: elapsed,
      nodesTraversed: res.targetNodes.length,
      edgesTraversed: res.targetEdges.length,
      matchedPathsCount: res.results.length,
      memoryKb: Math.round(24 + res.results.length * 3.5 + Math.random() * 12)
    });

    setExecStatus('completed');

    if (res.hops && res.hops.length > 0) {
      setCurrentHopIndex(0);
      setIsPlaying(true);
    }
  };

  const handleCopyResults = () => {
    const jsonStr = JSON.stringify(queryResults, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return currentGraph.nodes.filter(n => {
      const matchesFilter = nodeFilter === 'ALL' || n.type === nodeFilter;
      const matchesSearch = searchQuery === '' || 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.domain && n.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.role && n.role.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [currentGraph, nodeFilter, searchQuery]);

  // Current active traversal elements
  const activeHopData = useMemo(() => {
    if (currentHopIndex < 0 || !activeHops || !activeHops[currentHopIndex]) {
      return null;
    }
    return activeHops[currentHopIndex];
  }, [currentHopIndex, activeHops]);

  // All active nodes up to current step
  const activeNodesSet = useMemo(() => {
    if (currentHopIndex < 0 || !activeHops || activeHops.length === 0) {
      if (execStatus === 'completed') return new Set(activeTargetNodes);
      return new Set(activeTargetNodes);
    }
    const set = new Set();
    for (let i = 0; i <= currentHopIndex; i++) {
      if (activeHops[i]) {
        activeHops[i].activeNodes.forEach(nid => set.add(nid));
      }
    }
    return set;
  }, [currentHopIndex, activeHops, activeTargetNodes, execStatus]);

  // All active edges up to current step
  const activeEdgesSet = useMemo(() => {
    if (currentHopIndex < 0 || !activeHops || activeHops.length === 0) {
      if (execStatus === 'completed') return new Set(activeTargetEdges);
      return new Set(activeTargetEdges);
    }
    const set = new Set();
    for (let i = 0; i <= currentHopIndex; i++) {
      if (activeHops[i]) {
        activeHops[i].activeEdges.forEach(eid => set.add(eid));
      }
    }
    return set;
  }, [currentHopIndex, activeHops, activeTargetEdges, execStatus]);

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen pb-16">
      
      {/* Top Header & Domain Selector */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Graph Engine v4.8 Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                  Live Traversal Ready
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Advanced Cypher Queries &amp; Multi-Hop Pattern Matching
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                Execute variable-length path expressions (<code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded text-xs">[:REL*1..k]</code>), write custom Cypher queries, discover hidden triadic closures, evaluate sub-query aggregations with <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded text-xs">WITH</code>, and inspect live Cypher query results.
              </p>
            </div>

            {/* Domain Switcher */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start lg:self-center">
              <button
                onClick={() => handleDomainChange('academic')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDomain === 'academic'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Academic Citation Network
              </button>
              <button
                onClick={() => handleDomainChange('enterprise')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDomain === 'enterprise'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-emerald-600" />
                Enterprise Org &amp; Skill Graph
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Full-Width Animation Speed Controller Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 transition-all hover:border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
                <Sliders className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Animation Playback Speed Controller</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm">
                    {animationSpeed.toFixed(1)}x Speed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Controls graph traversal cadence, multi-hop step delay, and hidden connection reveal speed.
                </p>
              </div>
            </div>

            {/* Speed Presets Buttons */}
            <div className="flex items-center gap-1.5">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimationSpeed(spd)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    animationSpeed === spd
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Full-width range slider */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-slate-400">0.5x (Slow)</span>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.25"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="text-[11px] font-bold text-slate-700">3.0x (Instant)</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Guided Presets & Query Editor on Left, Graph Simulation on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Preset Queries & Cypher IDE (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Guided Presets Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Guided Cypher Query Presets
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">5 Scenarios</span>
              </div>
              <div className="space-y-1.5">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/50 shadow-sm'
                          : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                            {preset.name}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {preset.description}
                          </p>
                        </div>
                        {preset.hiddenLinks && preset.hiddenLinks.length > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Hidden Links
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Cypher Query Editor */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-[11px] font-bold shadow">
                    &gt;_
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">Cypher Query Terminal</h3>
                    <p className="text-[10px] text-slate-500">Live openCypher AST &amp; Custom Pattern Matcher</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomQuery(selectedPreset.query)}
                  title="Reset Query to Preset Default"
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 font-mono text-xs shadow-inner">
                <div className="bg-slate-900 px-3 py-1 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>query.cyp</span>
                  <span className="text-emerald-400 text-[10px] font-sans font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Editable Cypher Editor
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 text-slate-200 font-mono text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  spellCheck={false}
                  placeholder="// Type custom Cypher query here (e.g., MATCH (a:Author) RETURN a.label, a.hIndex)..."
                />
              </div>

              {/* Action Button - Full Width Execute */}
              <div className="pt-0.5">
                <button
                  onClick={handleExecuteQuery}
                  disabled={isPlaying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Execute Cypher Query
                </button>
              </div>
            </div>

            {/* Traversal Telemetry & Metrics Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                Traversal Telemetry &amp; Engine Metrics
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <div className="text-[9px] uppercase font-bold text-blue-600">Latency</div>
                  <div className="text-xs sm:text-sm font-extrabold text-blue-900 mt-0.5">{metrics.latencyMs}ms</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-[9px] uppercase font-bold text-emerald-600">Paths</div>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-900 mt-0.5">{metrics.matchedPathsCount}</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <div className="text-[9px] uppercase font-bold text-amber-600">Nodes</div>
                  <div className="text-xs sm:text-sm font-extrabold text-amber-900 mt-0.5">{metrics.nodesTraversed}</div>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                  <div className="text-[9px] uppercase font-bold text-purple-600">Edges</div>
                  <div className="text-xs sm:text-sm font-extrabold text-purple-900 mt-0.5">{metrics.edgesTraversed}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Compact SVG Canvas & Cypher Query Results Box (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Simulation Canvas Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              
              {/* Canvas Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800">
                    {currentGraph.name}
                  </span>
                </div>

                {/* Filter & Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search node..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 pr-2.5 py-1 bg-slate-100 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40"
                    />
                  </div>
                  <select
                    value={nodeFilter}
                    onChange={(e) => setNodeFilter(e.target.value)}
                    className="py-1 px-2 bg-slate-100 text-xs rounded-lg border border-slate-200 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Labels</option>
                    {selectedDomain === 'academic' ? (
                      <>
                        <option value="Author">Authors (:Author)</option>
                        <option value="Paper">Papers (:Paper)</option>
                        <option value="Venue">Venues (:Venue)</option>
                      </>
                    ) : (
                      <>
                        <option value="Person">People (:Person)</option>
                        <option value="Project">Projects (:Project)</option>
                        <option value="Skill">Skills (:Skill)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Playback Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  {isPlaying ? (
                    <button
                      onClick={handlePause}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm cursor-pointer"
                    >
                      <Pause className="w-3 h-3 fill-white" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={handlePlay}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Play Traversal
                    </button>
                  )}

                  <button
                    onClick={handleStepBackward}
                    title="Step Backward"
                    disabled={currentHopIndex <= 0}
                    className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    onClick={handleStepForward}
                    title="Step Forward"
                    disabled={currentHopIndex >= (activeHops?.length || 0) - 1}
                    className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleReset}
                    title="Reset Traversal"
                    className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress / Step indicator */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHiddenLinks}
                      onChange={(e) => setShowHiddenLinks(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-3 h-3"
                    />
                    <span className="font-semibold text-rose-700">Reveal Hidden Triads</span>
                  </label>

                  <div className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Step: {currentHopIndex >= 0 ? `${currentHopIndex + 1} / ${activeHops?.length || 1}` : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Active Hop Banner */}
              {activeHopData && (
                <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                      {activeHopData.step}
                    </span>
                    <span className="font-bold text-blue-900 text-[11px]">{activeHopData.label}</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium">
                    Active: {activeHopData.activeNodes.join(', ')}
                  </span>
                </div>
              )}

              {/* Compact Planar SVG Canvas (Height: 360px) */}
              <div className="relative w-full h-[360px] bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                
                {/* Canvas Grid Background */}
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{
                    backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                <svg 
                  viewBox="0 0 760 380" 
                  className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                >
                  <defs>
                    <marker
                      id="arrow-default"
                      viewBox="0 0 10 10"
                      refX="16"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="16"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                    <marker
                      id="arrow-hidden"
                      viewBox="0 0 10 10"
                      refX="16"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>

                  {/* Render Regular Edges */}
                  {currentGraph.edges.map((edge) => {
                    const srcNode = currentGraph.nodes.find(n => n.id === edge.source);
                    const tgtNode = currentGraph.nodes.find(n => n.id === edge.target);
                    if (!srcNode || !tgtNode) return null;

                    const isActive = activeEdgesSet.has(edge.id);
                    const isTargetEdge = activeTargetEdges.includes(edge.id);

                    const midX = (srcNode.x + tgtNode.x) / 2;
                    const midY = (srcNode.y + tgtNode.y) / 2;

                    return (
                      <g key={edge.id} className="transition-all duration-300">
                        {edge.curve ? (
                          <path
                            d={edge.curve}
                            fill="none"
                            stroke={isActive ? '#2563eb' : isTargetEdge && execStatus === 'completed' ? '#0d9488' : '#cbd5e1'}
                            strokeWidth={isActive ? 3 : isTargetEdge ? 2 : 1.2}
                            strokeDasharray={isActive ? 'none' : isTargetEdge ? '3 2' : 'none'}
                            markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                            className={isActive ? 'animate-pulse' : ''}
                          />
                        ) : (
                          <line
                            x1={srcNode.x}
                            y1={srcNode.y}
                            x2={tgtNode.x}
                            y2={tgtNode.y}
                            stroke={isActive ? '#2563eb' : isTargetEdge && execStatus === 'completed' ? '#0d9488' : '#cbd5e1'}
                            strokeWidth={isActive ? 3 : isTargetEdge ? 2 : 1.2}
                            strokeDasharray={isActive ? 'none' : isTargetEdge ? '3 2' : 'none'}
                            markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                            className={isActive ? 'animate-pulse' : ''}
                          />
                        )}

                        {/* Edge Short Label */}
                        <text
                          x={midX}
                          y={midY - 3}
                          textAnchor="middle"
                          fill={isActive ? '#1e3a8a' : '#64748b'}
                          fontSize={isActive ? 8.5 : 7}
                          fontWeight={isActive ? 'bold' : 'normal'}
                          className="select-none bg-white px-0.5"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Hidden Triadic Closures / Inferred Links */}
                  {showHiddenLinks && activeHiddenLinks && activeHiddenLinks.map((hlink, idx) => {
                    const srcNode = currentGraph.nodes.find(n => n.id === hlink.source);
                    const tgtNode = currentGraph.nodes.find(n => n.id === hlink.target);
                    if (!srcNode || !tgtNode) return null;

                    const midX = (srcNode.x + tgtNode.x) / 2;
                    const midY = (srcNode.y + tgtNode.y) / 2;

                    return (
                      <g key={`hidden-${idx}`} className="animate-fadeIn">
                        {hlink.curve ? (
                          <path
                            d={hlink.curve}
                            fill="none"
                            stroke="#e11d48"
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            markerEnd="url(#arrow-hidden)"
                            className="animate-pulse"
                          />
                        ) : (
                          <line
                            x1={srcNode.x}
                            y1={srcNode.y}
                            x2={tgtNode.x}
                            y2={tgtNode.y}
                            stroke="#e11d48"
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            markerEnd="url(#arrow-hidden)"
                            className="animate-pulse"
                          />
                        )}
                        <rect
                          x={midX - 35}
                          y={midY - 8}
                          width="70"
                          height="14"
                          rx="3"
                          fill="#ffe4e6"
                          stroke="#f43f5e"
                          strokeWidth="0.6"
                        />
                        <text
                          x={midX}
                          y={midY + 1}
                          textAnchor="middle"
                          fill="#be123c"
                          fontSize="7"
                          fontWeight="bold"
                          alignmentBaseline="middle"
                        >
                          Hidden Link
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Compact Nodes */}
                  {filteredNodes.map((node) => {
                    const isActive = activeNodesSet.has(node.id);
                    const isSelected = selectedNode?.id === node.id;
                    const isAuthorOrPerson = node.type === 'Author' || node.type === 'Person';

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer transition-all duration-300 group"
                      >
                        {/* Glow halo for active traversal node */}
                        {isActive && (
                          <circle
                            r="22"
                            fill="#3b82f6"
                            fillOpacity="0.2"
                            className="animate-ping"
                          />
                        )}

                        {/* Node Background Circle */}
                        <circle
                          r={isSelected ? 16 : isActive ? 15 : isAuthorOrPerson ? 14 : 13}
                          fill={isSelected ? '#1d4ed8' : isActive ? '#2563eb' : node.color}
                          stroke={isSelected ? '#ffffff' : isActive ? '#ffffff' : '#ffffff'}
                          strokeWidth={isSelected || isActive ? 2.5 : 1.8}
                          className="shadow transition-transform group-hover:scale-110"
                        />

                        {/* Short Node ID inside circle */}
                        <text
                          textAnchor="middle"
                          dy="3.5"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                          className="select-none pointer-events-none"
                        >
                          {node.id}
                        </text>

                        {/* Primary Label below Node */}
                        <text
                          textAnchor="middle"
                          dy="24"
                          fill={isActive ? '#1e3a8a' : '#1e293b'}
                          fontSize="8"
                          fontWeight={isActive ? 'bold' : '600'}
                          className="select-none pointer-events-none"
                        >
                          {node.label.length > 17 ? node.label.substring(0, 15) + '..' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Node Details Inspector */}
                {selectedNode && (
                  <div className="absolute bottom-3 left-3 max-w-xs bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg text-xs space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }}></span>
                        {selectedNode.label}
                      </span>
                      <button 
                        onClick={() => setSelectedNode(null)} 
                        className="text-slate-400 hover:text-slate-700 font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-slate-600 space-y-0.5 text-[10px]">
                      <div><strong className="text-slate-800">Label:</strong> :{selectedNode.type} ({selectedNode.id})</div>
                      {selectedNode.domain && <div><strong className="text-slate-800">Domain:</strong> {selectedNode.domain}</div>}
                      {selectedNode.hIndex && <div><strong className="text-slate-800">h-Index:</strong> {selectedNode.hIndex}</div>}
                      {selectedNode.citations && <div><strong className="text-slate-800">Citations:</strong> {selectedNode.citations}</div>}
                      {selectedNode.venue && <div><strong className="text-slate-800">Venue:</strong> {selectedNode.venue}</div>}
                      {selectedNode.role && <div><strong className="text-slate-800">Role:</strong> {selectedNode.role}</div>}
                      {selectedNode.dept && <div><strong className="text-slate-800">Dept:</strong> {selectedNode.dept}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-slate-800">Legend:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Author / Person
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Paper / Project
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    Venue / Skill
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-rose-600 border-dashed"></span>
                    Hidden Triad Link
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Planar Non-Crossing Topology
                </span>
              </div>

            </div>

            {/* Cypher Query Execution Results Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
                    <Table className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      Cypher Query Execution Results
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {queryResults?.length || 0} Records
                      </span>
                    </h3>
                  </div>
                </div>

                {/* View Mode Switcher & Copy */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setResultsViewMode('table')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        resultsViewMode === 'table'
                          ? 'bg-white text-blue-700 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setResultsViewMode('json')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        resultsViewMode === 'json'
                          ? 'bg-white text-blue-700 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  <button
                    onClick={handleCopyResults}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                    title="Copy Results JSON"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Error Notice if any */}
              {queryError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{queryError}</span>
                </div>
              )}

              {/* Table View */}
              {resultsViewMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-slate-400 font-mono text-[10px]">#</th>
                        {queryColumns?.map((col) => (
                          <th key={col} className="p-2.5 whitespace-nowrap text-slate-800 text-[11px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {queryResults && queryResults.length > 0 ? (
                        queryResults.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-2.5 font-mono text-[10px] text-slate-400 font-semibold">{idx + 1}</td>
                            {queryColumns?.map((col) => {
                              const val = row[col];
                              const isHop = col === 'HopDistance';
                              const isScore = col === 'AffinityScore' || col === 'Citations';
                              const isArray = typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'));

                              return (
                                <td key={col} className="p-2.5">
                                  {isHop ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      {val}
                                    </span>
                                  ) : isScore ? (
                                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                                      {val}
                                    </span>
                                  ) : isArray ? (
                                    <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] border border-slate-200">
                                      {val}
                                    </code>
                                  ) : (
                                    <span className="font-medium text-slate-800 text-[11px]">
                                      {val !== undefined && val !== null ? String(val) : '-'}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={(queryColumns?.length || 1) + 1} className="p-4 text-center text-slate-400 italic text-[11px]">
                            No records returned. Click &quot;Execute Cypher Query&quot; to run pattern evaluation.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Raw JSON View */
                <div className="rounded-xl border border-slate-300 bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner max-h-56">
                  <pre>{JSON.stringify(queryResults, null, 2)}</pre>
                </div>
              )}

              {/* Status Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Execution completed in {metrics.latencyMs}ms</span>
                </div>
                <span>Memory consumed: <strong>{metrics.memoryKb} KB</strong></span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
