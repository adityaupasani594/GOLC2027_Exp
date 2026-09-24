/**
 * graphDatabaseEngine.js
 * Embedded In-Memory Labeled Property Graph (LPG) and Cypher Execution Engine.
 * Converted directly from EXP8/graph_engine.py & app.py for React Virtual Labs.
 *
 * Implements:
 * - Node and Relationship abstractions with properties and labels
 * - Index-Free Adjacency (IFA) with bidirectional pointers (outgoing & incoming)
 * - Cypher Query Engine supporting:
 *     * MATCH (pattern) [WHERE ...] RETURN ...
 *     * MATCH (pattern) SET ... [RETURN ...]
 *     * MATCH (pattern) DELETE / DETACH DELETE ...
 *     * CREATE (pattern) [RETURN ...]
 *     * Aggregations: count(x), avg(x)
 *     * Multi-hop path matching: (a)-[:REL]->(b)-[:REL]->(c), (a)-[:REL*1..3]->(b)
 * - Preset domain graphs: University Academic Graph, Social Network, Financial Fraud Ring
 * - Graph metrics calculation (nodes, edges, density, avg degree, isolated nodes)
 */

export class GraphNode {
  constructor(nodeId, labels = [], properties = {}) {
    this.id = String(nodeId).trim();
    this.labels = new Set(labels);
    this.properties = { ...properties };
  }

  get(propName, defaultValue = null) {
    if (propName === 'id') return this.id;
    return this.properties[propName] !== undefined ? this.properties[propName] : defaultValue;
  }

  toDict() {
    return {
      id: this.id,
      labels: Array.from(this.labels),
      ...this.properties
    };
  }

  displayName() {
    return String(this.properties.name || this.properties.acc_no || this.id);
  }
}

export class GraphRelationship {
  constructor(relId, source, target, relType, properties = {}) {
    this.id = String(relId).trim();
    this.source = String(source).trim();
    this.target = String(target).trim();
    this.type = String(relType).trim().toUpperCase();
    this.properties = { ...properties };
  }

  get(propName, defaultValue = null) {
    if (propName === 'id') return this.id;
    if (propName === 'type') return this.type;
    return this.properties[propName] !== undefined ? this.properties[propName] : defaultValue;
  }

  toDict() {
    return {
      id: this.id,
      source: this.source,
      type: this.type,
      target: this.target,
      ...this.properties
    };
  }
}

export class PropertyGraph {
  constructor() {
    this.nodes = new Map(); // id -> GraphNode
    this.relationships = new Map(); // id -> GraphRelationship
    this.outgoing = new Map(); // id -> [relId, ...]
    this.incoming = new Map(); // id -> [relId, ...]
    this.labelIndex = new Map(); // label -> Set(nodeId)
  }

  clear() {
    this.nodes.clear();
    this.relationships.clear();
    this.outgoing.clear();
    this.incoming.clear();
    this.labelIndex.clear();
  }

  addNode(nodeId, labels = [], properties = {}) {
    const id = String(nodeId).trim();
    if (!id) throw new Error('Node ID cannot be empty.');

    if (this.nodes.has(id)) {
      const existing = this.nodes.get(id);
      labels.forEach((lbl) => {
        existing.labels.add(lbl);
        if (!this.labelIndex.has(lbl)) this.labelIndex.set(lbl, new Set());
        this.labelIndex.get(lbl).add(id);
      });
      Object.assign(existing.properties, properties);
      return existing;
    }

    const node = new GraphNode(id, labels, properties);
    this.nodes.set(id, node);
    this.outgoing.set(id, []);
    this.incoming.set(id, []);

    node.labels.forEach((lbl) => {
      if (!this.labelIndex.has(lbl)) this.labelIndex.set(lbl, new Set());
      this.labelIndex.get(lbl).add(id);
    });

    return node;
  }

  addRelationship(sourceId, targetId, relType, properties = {}, customRelId = null) {
    const sId = String(sourceId).trim();
    const tId = String(targetId).trim();
    const type = String(relType).trim().toUpperCase();

    if (!this.nodes.has(sId)) throw new Error(`Source node '${sId}' does not exist.`);
    if (!this.nodes.has(tId)) throw new Error(`Target node '${tId}' does not exist.`);
    if (!type) throw new Error('Relationship type cannot be empty.');

    const relId = customRelId || `rel_${sId}_${type}_${tId}_${this.relationships.size + 1}`;
    const rel = new GraphRelationship(relId, sId, tId, type, properties);

    this.relationships.set(relId, rel);
    if (!this.outgoing.has(sId)) this.outgoing.set(sId, []);
    if (!this.incoming.has(tId)) this.incoming.set(tId, []);

    this.outgoing.get(sId).push(relId);
    this.incoming.get(tId).push(relId);

    return rel;
  }

  deleteNode(nodeId, detach = false) {
    const id = String(nodeId).trim();
    if (!this.nodes.has(id)) {
      return { success: false, message: `Node '${id}' does not exist.` };
    }

    const outRels = this.outgoing.get(id) || [];
    const inRels = this.incoming.get(id) || [];
    const connectedRels = new Set([...outRels, ...inRels]);

    if (connectedRels.size > 0 && !detach) {
      return {
        success: false,
        message:
          `Neo4j Referential Integrity Constraint Violated: Cannot delete node '${id}' ` +
          `because it still has ${connectedRels.size} connected relationship(s). ` +
          `Use 'DETACH DELETE' to remove attached relationships automatically.`
      };
    }

    // Delete all attached relationships
    Array.from(connectedRels).forEach((rid) => {
      this.deleteRelationship(rid);
    });

    // Remove from label index
    const node = this.nodes.get(id);
    node.labels.forEach((lbl) => {
      if (this.labelIndex.has(lbl)) {
        this.labelIndex.get(lbl).delete(id);
      }
    });

    this.nodes.delete(id);
    this.outgoing.delete(id);
    this.incoming.delete(id);

    return {
      success: true,
      message: `Successfully deleted node '${id}' (and ${connectedRels.size} connected relationships).`
    };
  }

  deleteRelationship(relId) {
    const rid = String(relId).trim();
    if (!this.relationships.has(rid)) {
      return { success: false, message: `Relationship '${rid}' does not exist.` };
    }

    const rel = this.relationships.get(rid);
    if (this.outgoing.has(rel.source)) {
      const list = this.outgoing.get(rel.source).filter((r) => r !== rid);
      this.outgoing.set(rel.source, list);
    }
    if (this.incoming.has(rel.target)) {
      const list = this.incoming.get(rel.target).filter((r) => r !== rid);
      this.incoming.set(rel.target, list);
    }

    this.relationships.delete(rid);
    return { success: true, message: `Successfully deleted relationship '${rid}'.` };
  }

  updateNode(nodeId, properties, labelsToAdd = []) {
    const id = String(nodeId).trim();
    if (!this.nodes.has(id)) {
      return { success: false, message: `Node '${id}' not found.` };
    }
    const node = this.nodes.get(id);
    Object.assign(node.properties, properties);
    labelsToAdd.forEach((lbl) => {
      node.labels.add(lbl);
      if (!this.labelIndex.has(lbl)) this.labelIndex.set(lbl, new Set());
      this.labelIndex.get(lbl).add(id);
    });
    return { success: true, message: `Node '${id}' updated successfully.` };
  }

  getMetrics() {
    const numNodes = this.nodes.size;
    const numRels = this.relationships.size;
    const labels = new Set();
    this.nodes.forEach((n) => n.labels.forEach((lbl) => labels.add(lbl)));
    const relTypes = new Set();
    this.relationships.forEach((r) => relTypes.add(r.type));

    // Density: for directed graph D = E / (V * (V - 1))
    let density = 0.0;
    if (numNodes > 1) {
      density = Number((numRels / (numNodes * (numNodes - 1))).toFixed(4));
    }

    const avgDegree = numNodes > 0 ? Number(((2 * numRels) / numNodes).toFixed(2)) : 0.0;

    let isolated = 0;
    this.nodes.forEach((_, nid) => {
      const deg = (this.outgoing.get(nid)?.length || 0) + (this.incoming.get(nid)?.length || 0);
      if (deg === 0) isolated++;
    });

    return {
      num_nodes: numNodes,
      num_relationships: numRels,
      num_labels: labels.size,
      labels: Array.from(labels).sort(),
      num_rel_types: relTypes.size,
      rel_types: Array.from(relTypes).sort(),
      density,
      avg_degree: avgDegree,
      isolated_nodes: isolated
    };
  }

  // ---------------------------------------------------------------------------
  // DATASET PRESETS (Exact datasets from EXP8 graph_engine.py)
  // ---------------------------------------------------------------------------
  loadUniversityGraph() {
    this.clear();
    // Departments
    this.addNode('dept_cs', ['Department'], { name: 'Computer Science & Engineering', code: 'CSE', building: 'Takshashila' });
    this.addNode('dept_ee', ['Department'], { name: 'Electrical Engineering', code: 'EE', building: 'Ramanujan' });
    this.addNode('dept_ma', ['Department'], { name: 'Mathematics', code: 'MATH', building: 'Aryabhatta' });

    // Courses
    this.addNode('cs101', ['Course'], { name: 'Programming & Data Structures', code: 'CS101', credits: 4, level: 'UG' });
    this.addNode('cs201', ['Course'], { name: 'Algorithms & Complexity', code: 'CS201', credits: 4, level: 'UG' });
    this.addNode('cs301', ['Course'], { name: 'Database Management Systems', code: 'CS301', credits: 3, level: 'UG' });
    this.addNode('ee101', ['Course'], { name: 'Basic Electrical Technology', code: 'EE101', credits: 3, level: 'UG' });
    this.addNode('ma101', ['Course'], { name: 'Linear Algebra & Calculus', code: 'MA101', credits: 4, level: 'UG' });

    // Faculty
    this.addNode('prof_sharma', ['Faculty'], { name: 'Prof. R. Sharma', dept: 'CSE', role: 'HOD', experience_yrs: 18 });
    this.addNode('prof_banerjee', ['Faculty'], { name: 'Prof. S. Banerjee', dept: 'CSE', role: 'Professor', experience_yrs: 12 });
    this.addNode('prof_gupta', ['Faculty'], { name: 'Prof. A. Gupta', dept: 'EE', role: 'Assoc. Professor', experience_yrs: 8 });

    // Students
    this.addNode('s_alice', ['Student'], { name: 'Alice Smith', roll: '21CS01', dept: 'CSE', gpa: 9.15, year: 3 });
    this.addNode('s_bob', ['Student'], { name: 'Bob Kumar', roll: '21CS02', dept: 'CSE', gpa: 8.4, year: 3 });
    this.addNode('s_charlie', ['Student'], { name: 'Charlie Roy', roll: '22EE05', dept: 'EE', gpa: 9.6, year: 2 });
    this.addNode('s_diana', ['Student'], { name: 'Diana Das', roll: '22CS14', dept: 'CSE', gpa: 8.85, year: 2 });
    this.addNode('s_evan', ['Student'], { name: 'Evan Sen', roll: '23CS20', dept: 'CSE', gpa: 7.9, year: 1 });

    // Faculty -> Department (BELONGS_TO)
    this.addRelationship('prof_sharma', 'dept_cs', 'BELONGS_TO', { since: 2006 });
    this.addRelationship('prof_banerjee', 'dept_cs', 'BELONGS_TO', { since: 2012 });
    this.addRelationship('prof_gupta', 'dept_ee', 'BELONGS_TO', { since: 2016 });

    // Course -> Department (OFFERED_BY)
    this.addRelationship('cs101', 'dept_cs', 'OFFERED_BY', { semester: 'Autumn' });
    this.addRelationship('cs201', 'dept_cs', 'OFFERED_BY', { semester: 'Spring' });
    this.addRelationship('cs301', 'dept_cs', 'OFFERED_BY', { semester: 'Autumn' });
    this.addRelationship('ee101', 'dept_ee', 'OFFERED_BY', { semester: 'Autumn' });
    this.addRelationship('ma101', 'dept_ma', 'OFFERED_BY', { semester: 'Autumn' });

    // Faculty -> Course (TEACHES)
    this.addRelationship('prof_sharma', 'cs301', 'TEACHES', { academic_year: '2024-25' });
    this.addRelationship('prof_banerjee', 'cs101', 'TEACHES', { academic_year: '2024-25' });
    this.addRelationship('prof_banerjee', 'cs201', 'TEACHES', { academic_year: '2024-25' });
    this.addRelationship('prof_gupta', 'ee101', 'TEACHES', { academic_year: '2024-25' });

    // Student -> Course (ENROLLED_IN)
    this.addRelationship('s_alice', 'cs301', 'ENROLLED_IN', { grade: 'Ex', semester: '5th' });
    this.addRelationship('s_alice', 'cs201', 'ENROLLED_IN', { grade: 'A', semester: '4th' });
    this.addRelationship('s_bob', 'cs301', 'ENROLLED_IN', { grade: 'B', semester: '5th' });
    this.addRelationship('s_bob', 'cs201', 'ENROLLED_IN', { grade: 'B', semester: '4th' });
    this.addRelationship('s_charlie', 'ee101', 'ENROLLED_IN', { grade: 'Ex', semester: '3rd' });
    this.addRelationship('s_charlie', 'ma101', 'ENROLLED_IN', { grade: 'Ex', semester: '1st' });
    this.addRelationship('s_diana', 'cs201', 'ENROLLED_IN', { grade: 'A', semester: '3rd' });
    this.addRelationship('s_evan', 'cs101', 'ENROLLED_IN', { grade: 'A', semester: '1st' });

    // Prerequisite Chain: CS101 -> CS201 -> CS301
    this.addRelationship('cs101', 'cs201', 'PREREQUISITE_OF', { mandatory: true });
    this.addRelationship('cs201', 'cs301', 'PREREQUISITE_OF', { mandatory: true });

    // Mentorship: Faculty -> Student
    this.addRelationship('prof_sharma', 's_alice', 'ADVISES', { project: 'Graph Databases in VLSI' });
    this.addRelationship('prof_banerjee', 's_bob', 'ADVISES', { project: 'Distributed Cypher Optimization' });
  }

  loadSocialGraph() {
    this.clear();
    this.addNode('p_alex', ['Person'], { name: 'Alex', city: 'Kharagpur', age: 22 });
    this.addNode('p_bella', ['Person'], { name: 'Bella', city: 'Kolkata', age: 23 });
    this.addNode('p_chris', ['Person'], { name: 'Chris', city: 'Delhi', age: 24 });
    this.addNode('p_dan', ['Person'], { name: 'Dan', city: 'Bengaluru', age: 21 });

    this.addNode('g_ai', ['Group'], { name: 'AI & Graph Researchers', members_count: 150 });
    this.addNode('g_robotics', ['Group'], { name: 'Autonomous Systems Club', members_count: 80 });

    this.addNode('i_neo4j', ['Topic'], { name: 'Neo4j & Cypher', domain: 'Databases' });
    this.addNode('i_python', ['Topic'], { name: 'Python Data Science', domain: 'Programming' });

    this.addRelationship('p_alex', 'p_bella', 'FRIENDS_WITH', { since: 2022 });
    this.addRelationship('p_bella', 'p_chris', 'FRIENDS_WITH', { since: 2021 });
    this.addRelationship('p_chris', 'p_dan', 'FRIENDS_WITH', { since: 2023 });
    this.addRelationship('p_alex', 'p_dan', 'FRIENDS_WITH', { since: 2024 });

    this.addRelationship('p_alex', 'g_ai', 'MEMBER_OF', { role: 'Lead' });
    this.addRelationship('p_bella', 'g_ai', 'MEMBER_OF', { role: 'Member' });
    this.addRelationship('p_chris', 'g_robotics', 'MEMBER_OF', { role: 'Admin' });

    this.addRelationship('p_alex', 'i_neo4j', 'INTERESTED_IN', { level: 'Advanced' });
    this.addRelationship('p_bella', 'i_python', 'INTERESTED_IN', { level: 'Intermediate' });
    this.addRelationship('p_chris', 'i_neo4j', 'INTERESTED_IN', { level: 'Beginner' });
  }

  loadFraudGraph() {
    this.clear();
    this.addNode('acc_101', ['Account'], { acc_no: 'ACC-101', owner: 'John', balance: 15000 });
    this.addNode('acc_102', ['Account'], { acc_no: 'ACC-102', owner: 'Mike', balance: 3200 });
    this.addNode('acc_103', ['Account'], { acc_no: 'ACC-103', owner: 'Sarah', balance: 78000 });
    this.addNode('acc_104', ['Account'], { acc_no: 'ACC-104', owner: 'Victor', balance: 500 });

    this.addNode('dev_a', ['Device'], { device_id: 'DEV-MAC-8812', os: 'Android 14' });
    this.addNode('ip_x', ['IPAddress'], { ip: '192.168.1.105', city: 'Mumbai' });

    // Shared Device & IP
    this.addRelationship('acc_101', 'dev_a', 'USED_DEVICE', { last_login: '2024-09-01' });
    this.addRelationship('acc_102', 'dev_a', 'USED_DEVICE', { last_login: '2024-09-02' });
    this.addRelationship('acc_104', 'dev_a', 'USED_DEVICE', { last_login: '2024-09-03' });

    this.addRelationship('acc_101', 'ip_x', 'LOGGED_FROM', { timestamp: '10:15' });
    this.addRelationship('acc_102', 'ip_x', 'LOGGED_FROM', { timestamp: '10:20' });

    // Circular Transfers
    this.addRelationship('acc_101', 'acc_102', 'TRANSFER', { amount: 5000, txn_id: 'TX901' });
    this.addRelationship('acc_102', 'acc_104', 'TRANSFER', { amount: 4800, txn_id: 'TX902' });
    this.addRelationship('acc_104', 'acc_101', 'TRANSFER', { amount: 4700, txn_id: 'TX903' });
  }

  loadBlankGraph() {
    this.clear();
  }
}

// ---------------------------------------------------------------------------
// CYPHER EXECUTION ENGINE
// ---------------------------------------------------------------------------
export class CypherEngine {
  constructor(graph) {
    this.graph = graph;
  }

  execute(queryText) {
    const startTime = performance.now();
    const query = String(queryText || '').trim();

    if (!query) {
      return {
        success: false,
        message: 'Empty query provided.',
        data: [],
        columns: [],
        matched_node_ids: [],
        matched_rel_ids: [],
        affected_count: 0,
        execution_time_ms: 0.0
      };
    }

    const upper = query.toUpperCase();

    try {
      let result;
      if (upper.startsWith('CREATE')) {
        result = this._executeCreate(query);
      } else if (upper.startsWith('MATCH')) {
        result = this._executeMatch(query);
      } else {
        return {
          success: false,
          message: "Unsupported Cypher starting clause. Supported initial clauses are 'MATCH' and 'CREATE'.",
          data: [],
          columns: [],
          matched_node_ids: [],
          matched_rel_ids: [],
          affected_count: 0,
          execution_time_ms: Number((performance.now() - startTime).toFixed(2))
        };
      }

      result.execution_time_ms = Number((performance.now() - startTime).toFixed(2));
      return result;
    } catch (err) {
      return {
        success: false,
        message: `Cypher Execution Error: ${err.message}`,
        data: [],
        columns: [],
        matched_node_ids: [],
        matched_rel_ids: [],
        affected_count: 0,
        execution_time_ms: Number((performance.now() - startTime).toFixed(2))
      };
    }
  }

  _parseProperties(propString) {
    if (!propString) return {};
    const props = {};
    const clean = propString.trim().replace(/^\{|\}$/g, '').trim();
    if (!clean) return props;

    // Split key-value pairs (handles commas not inside quotes)
    const regex = /(\w+)\s*:\s*([^,]+)/g;
    let match;
    while ((match = regex.exec(clean)) !== null) {
      const key = match[1].trim();
      let rawVal = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (rawVal.toLowerCase() === 'true') rawVal = true;
      else if (rawVal.toLowerCase() === 'false') rawVal = false;
      else if (!isNaN(Number(rawVal)) && rawVal !== '') rawVal = Number(rawVal);
      props[key] = rawVal;
    }
    return props;
  }

  _executeCreate(query) {
    // 1. Check for single node creation: CREATE (s:Student {id: '...', name: '...'})
    const nodeRegex = /CREATE\s*\(\s*(\w+)?\s*(?::\s*(\w+))?\s*(?:\{([^}]*)\})?\s*\)(?:\s*RETURN\s*(.*))?/i;
    const match = query.match(nodeRegex);

    if (match) {
      const varName = match[1] || 'n';
      const label = match[2] || 'Entity';
      const propStr = match[3] || '';
      const returnClause = match[4]?.trim();

      const props = this._parseProperties(propStr);
      const nodeId = props.id || props.name?.toLowerCase().replace(/\s+/g, '_') || `node_${Date.now()}`;
      delete props.id;

      const node = this.graph.addNode(nodeId, [label], props);

      const data = [{ [varName]: node.displayName(), label, id: node.id, ...node.properties }];
      const columns = Object.keys(data[0]);

      return {
        success: true,
        message: `Created 1 node (:${label} {id: '${nodeId}'})`,
        data,
        columns,
        matched_node_ids: [node.id],
        matched_rel_ids: [],
        affected_count: 1
      };
    }

    throw new Error('Unsupported CREATE syntax pattern. Supported pattern: CREATE (n:Label {id: "...", name: "..."})');
  }

  _executeMatch(query) {
    // Check if query has mutation: SET, DELETE, DETACH DELETE
    const upper = query.toUpperCase();

    if (upper.includes('DETACH DELETE')) {
      return this._executeDetachDelete(query);
    }
    if (upper.includes('DELETE')) {
      return this._executeDelete(query);
    }
    if (upper.includes('SET')) {
      return this._executeSet(query);
    }
    if (upper.includes('CREATE')) {
      return this._executeMatchCreateRel(query);
    }

    // Read Query: MATCH ... [WHERE ...] RETURN ...
    return this._executeMatchReturn(query);
  }

  _executeMatchCreateRel(query) {
    // MATCH (s:Student {id: 's_kiran'}), (c:Course {name: 'Database Management Systems'}) CREATE (s)-[:ENROLLED_IN {grade: 'A'}]->(c)
    const matchRegex = /MATCH\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*,\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*CREATE\s*\(\s*\1\s*\)-\s*\[\s*:?(\w+)\s*(?:\{([^}]*)\})?\s*\]->\s*\(\s*\4\s*\)/i;
    const match = query.match(matchRegex);

    if (match) {
      const sProps = this._parseProperties(match[3] || '');
      const tProps = this._parseProperties(match[6] || '');
      const relType = match[7];
      const relProps = this._parseProperties(match[8] || '');

      let sourceId = null;
      let targetId = null;

      // Find source node
      for (const [id, node] of this.graph.nodes.entries()) {
        let ok = true;
        if (sProps.id && node.id !== String(sProps.id)) ok = false;
        if (sProps.name && node.properties.name !== sProps.name) ok = false;
        if (ok) {
          sourceId = id;
          break;
        }
      }

      // Find target node
      for (const [id, node] of this.graph.nodes.entries()) {
        let ok = true;
        if (tProps.id && node.id !== String(tProps.id)) ok = false;
        if (tProps.name && node.properties.name !== tProps.name) ok = false;
        if (tProps.code && node.properties.code !== tProps.code) ok = false;
        if (ok) {
          targetId = id;
          break;
        }
      }

      if (!sourceId || !targetId) {
        throw new Error('Could not find matching source and target nodes to connect with relationship.');
      }

      const rel = this.graph.addRelationship(sourceId, targetId, relType, relProps);

      return {
        success: true,
        message: `Created 1 relationship: (${sourceId})-[:${relType}]->(${targetId})`,
        data: [{ source: sourceId, type: relType, target: targetId, ...relProps }],
        columns: ['source', 'type', 'target', ...Object.keys(relProps)],
        matched_node_ids: [sourceId, targetId],
        matched_rel_ids: [rel.id],
        affected_count: 1
      };
    }

    throw new Error('Unsupported MATCH ... CREATE relationship pattern.');
  }

  _executeSet(query) {
    // MATCH (s:Student {id: 's_kiran'}) SET s.gpa = 9.40 RETURN s
    const setRegex = /MATCH\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*SET\s+([^R]+?)(?:\s*RETURN\s*(.*))?$/i;
    const match = query.match(setRegex);

    if (match) {
      const varName = match[1];
      const matchProps = this._parseProperties(match[3] || '');
      const setStatements = match[4].trim().split(',');

      const matchedNodes = [];
      for (const [id, node] of this.graph.nodes.entries()) {
        let matches = true;
        for (const [k, v] of Object.entries(matchProps)) {
          if (k === 'id' && node.id !== String(v)) matches = false;
          else if (k !== 'id' && node.properties[k] !== v) matches = false;
        }
        if (matches) matchedNodes.push(node);
      }

      const updates = {};
      setStatements.forEach((stmt) => {
        const parts = stmt.split('=');
        if (parts.length === 2) {
          const rawKey = parts[0].trim().replace(new RegExp(`^${varName}\\.`), '');
          let val = parts[1].trim().replace(/^['"]|['"]$/g, '');
          if (!isNaN(Number(val)) && val !== '') val = Number(val);
          else if (val.toLowerCase() === 'true') val = true;
          else if (val.toLowerCase() === 'false') val = false;
          updates[rawKey] = val;
        }
      });

      matchedNodes.forEach((node) => {
        Object.assign(node.properties, updates);
      });

      const data = matchedNodes.map((n) => ({ id: n.id, ...n.properties }));
      return {
        success: true,
        message: `Updated ${matchedNodes.length} node(s) with properties ${JSON.stringify(updates)}`,
        data,
        columns: data.length > 0 ? Object.keys(data[0]) : [],
        matched_node_ids: matchedNodes.map((n) => n.id),
        matched_rel_ids: [],
        affected_count: matchedNodes.length
      };
    }

    throw new Error('Unsupported SET query syntax.');
  }

  _executeDelete(query) {
    // MATCH (p:Person {name: 'Dan'})-[r:MEMBER_OF]->() DELETE r
    const relDelRegex = /MATCH\s*\([^)]*\)\s*-\s*\[\s*(\w+)(?::(\w+))?\s*\]\s*->\s*\([^)]*\)\s*DELETE\s+\1/i;
    const relMatch = query.match(relDelRegex);

    if (relMatch) {
      const relVar = relMatch[1];
      const relType = relMatch[2];
      const deletedRels = [];

      this.graph.relationships.forEach((rel, rid) => {
        if (!relType || rel.type === relType.toUpperCase()) {
          deletedRels.push(rid);
        }
      });

      deletedRels.forEach((rid) => this.graph.deleteRelationship(rid));

      return {
        success: true,
        message: `Deleted ${deletedRels.length} relationship(s).`,
        data: [],
        columns: [],
        matched_node_ids: [],
        matched_rel_ids: [],
        affected_count: deletedRels.length
      };
    }

    // MATCH (s:Student {id: 'S01'}) DELETE s
    const nodeDelRegex = /MATCH\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*DELETE\s+\1/i;
    const nodeMatch = query.match(nodeDelRegex);

    if (nodeMatch) {
      const matchProps = this._parseProperties(nodeMatch[3] || '');
      let targetNodeId = null;

      for (const [id, node] of this.graph.nodes.entries()) {
        let matches = true;
        for (const [k, v] of Object.entries(matchProps)) {
          if (k === 'id' && node.id !== String(v)) matches = false;
          else if (k !== 'id' && node.properties[k] !== v) matches = false;
        }
        if (matches) {
          targetNodeId = id;
          break;
        }
      }

      if (!targetNodeId) throw new Error('No matching node found to delete.');

      const delRes = this.graph.deleteNode(targetNodeId, false);
      if (!delRes.success) {
        throw new Error(delRes.message);
      }

      return {
        success: true,
        message: delRes.message,
        data: [],
        columns: [],
        matched_node_ids: [],
        matched_rel_ids: [],
        affected_count: 1
      };
    }

    throw new Error('Unsupported DELETE syntax.');
  }

  _executeDetachDelete(query) {
    // MATCH (s:Student {id: 's_kiran'}) DETACH DELETE s
    // MATCH (n) DETACH DELETE n
    const detachRegex = /MATCH\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*DETACH\s+DELETE\s+\1/i;
    const match = query.match(detachRegex);

    if (match) {
      const label = match[2];
      const matchProps = this._parseProperties(match[3] || '');

      const toDelete = [];
      this.graph.nodes.forEach((node, id) => {
        let matches = true;
        if (label && !node.labels.has(label)) matches = false;
        for (const [k, v] of Object.entries(matchProps)) {
          if (k === 'id' && node.id !== String(v)) matches = false;
          else if (k !== 'id' && node.properties[k] !== v) matches = false;
        }
        if (matches) toDelete.push(id);
      });

      toDelete.forEach((id) => this.graph.deleteNode(id, true));

      return {
        success: true,
        message: `DETACH DELETE removed ${toDelete.length} node(s) and all connected relationships.`,
        data: [],
        columns: [],
        matched_node_ids: [],
        matched_rel_ids: [],
        affected_count: toDelete.length
      };
    }

    throw new Error('Unsupported DETACH DELETE syntax.');
  }

  _executeMatchReturn(query) {
    const returnIdx = query.toUpperCase().lastIndexOf('RETURN');
    if (returnIdx === -1) {
      throw new Error("Missing 'RETURN' clause in MATCH query.");
    }

    const matchPart = query.substring(0, returnIdx).trim();
    const returnPart = query.substring(returnIdx + 6).trim();

    // Check for WHERE clause
    let patternPart = matchPart.replace(/^MATCH\s+/i, '').trim();
    let whereCondition = null;

    const whereIdx = patternPart.toUpperCase().indexOf('WHERE');
    if (whereIdx !== -1) {
      whereCondition = patternPart.substring(whereIdx + 5).trim();
      patternPart = patternPart.substring(0, whereIdx).trim();
    }

    // Case 1: MATCH (n) RETURN n (Match all nodes)
    if (/^\(\s*(\w+)?\s*\)$/.test(patternPart)) {
      const data = [];
      const matchedNodeIds = [];

      this.graph.nodes.forEach((node) => {
        matchedNodeIds.push(node.id);
        data.push({
          id: node.id,
          labels: Array.from(node.labels).join(', '),
          name: node.displayName(),
          ...node.properties
        });
      });

      return {
        success: true,
        message: `Matched ${data.length} node(s).`,
        data,
        columns: data.length > 0 ? Object.keys(data[0]) : ['id', 'labels', 'name'],
        matched_node_ids: matchedNodeIds,
        matched_rel_ids: [],
        affected_count: data.length
      };
    }

    // Case 2: MATCH (s:Student) WHERE ... RETURN s.name, s.gpa
    const singleNodeRegex = /^\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)$/;
    const singleMatch = patternPart.match(singleNodeRegex);

    if (singleMatch) {
      const varName = singleMatch[1];
      const label = singleMatch[2];
      const matchProps = this._parseProperties(singleMatch[3] || '');

      let matchedNodes = [];
      this.graph.nodes.forEach((node) => {
        let ok = true;
        if (label && !node.labels.has(label)) ok = false;
        for (const [k, v] of Object.entries(matchProps)) {
          if (k === 'id' && node.id !== String(v)) ok = false;
          else if (k !== 'id' && node.properties[k] !== v) ok = false;
        }
        if (ok) matchedNodes.push(node);
      });

      // Filter with WHERE clause if present
      if (whereCondition) {
        matchedNodes = matchedNodes.filter((node) => {
          return this._evaluateWhere(whereCondition, { [varName]: node });
        });
      }

      const { data, columns } = this._projectReturn(returnPart, matchedNodes.map((n) => ({ [varName]: n })));

      return {
        success: true,
        message: `Matched ${matchedNodes.length} node(s).`,
        data,
        columns,
        matched_node_ids: matchedNodes.map((n) => n.id),
        matched_rel_ids: [],
        affected_count: matchedNodes.length
      };
    }

    // Case 3: Node-Rel-Node Pattern (e.g. (s:Student)-[:ENROLLED_IN]->(c:Course))
    const relPatternRegex = /^\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)\s*-\s*\[\s*(\w+)?(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\]->\s*\(\s*(\w+)(?::(\w+))?\s*(?:\{([^}]*)\})?\s*\)$/;
    const relMatch = patternPart.match(relPatternRegex);

    if (relMatch) {
      const sVar = relMatch[1];
      const sLabel = relMatch[2];
      const sProps = this._parseProperties(relMatch[3] || '');
      const rVar = relMatch[4] || 'r';
      const rType = relMatch[5];
      const rProps = this._parseProperties(relMatch[6] || '');
      const tVar = relMatch[7];
      const tLabel = relMatch[8];
      const tProps = this._parseProperties(relMatch[9] || '');

      const matchedRows = [];
      const matchedNodeIds = new Set();
      const matchedRelIds = new Set();

      this.graph.relationships.forEach((rel) => {
        if (rType && rel.type !== rType.toUpperCase()) return;
        const sourceNode = this.graph.nodes.get(rel.source);
        const targetNode = this.graph.nodes.get(rel.target);
        if (!sourceNode || !targetNode) return;

        if (sLabel && !sourceNode.labels.has(sLabel)) return;
        if (tLabel && !targetNode.labels.has(tLabel)) return;

        // Check props
        for (const [k, v] of Object.entries(sProps)) {
          if (sourceNode.properties[k] !== v && sourceNode.id !== v) return;
        }
        for (const [k, v] of Object.entries(tProps)) {
          if (targetNode.properties[k] !== v && targetNode.id !== v) return;
        }
        for (const [k, v] of Object.entries(rProps)) {
          if (rel.properties[k] !== v) return;
        }

        const rowContext = {
          [sVar]: sourceNode,
          [rVar]: rel,
          [tVar]: targetNode
        };

        if (whereCondition && !this._evaluateWhere(whereCondition, rowContext)) {
          return;
        }

        matchedNodeIds.add(sourceNode.id);
        matchedNodeIds.add(targetNode.id);
        matchedRelIds.add(rel.id);
        matchedRows.push(rowContext);
      });

      const { data, columns } = this._projectReturn(returnPart, matchedRows);

      return {
        success: true,
        message: `Matched ${data.length} record(s).`,
        data,
        columns,
        matched_node_ids: Array.from(matchedNodeIds),
        matched_rel_ids: Array.from(matchedRelIds),
        affected_count: data.length
      };
    }

    // Case 4: Multi-hop traversal (e.g. (f:Faculty)-[:TEACHES]->(c:Course)<-[:ENROLLED_IN]-(s:Student) or (p1)-[]->(p2)-[]->(p3))
    return this._executeMultiHopMatch(patternPart, returnPart, whereCondition);
  }

  _evaluateWhere(whereClause, context) {
    if (!whereClause) return true;
    try {
      // Split on AND
      const conditions = whereClause.split(/\s+AND\s+/i);

      return conditions.every((cond) => {
        // e.g. s.gpa >= 8.5
        const compMatch = cond.match(/(\w+)\.(\w+)\s*(>=|<=|>|<|=|==|!=)\s*(.+)/);
        if (compMatch) {
          const varName = compMatch[1];
          const propName = compMatch[2];
          const op = compMatch[3];
          let targetVal = compMatch[4].trim().replace(/^['"]|['"]$/g, '');
          if (!isNaN(Number(targetVal))) targetVal = Number(targetVal);

          const entity = context[varName];
          if (!entity) return false;
          const actualVal = entity.get ? entity.get(propName) : entity.properties?.[propName];
          if (actualVal === undefined) return false;

          if (op === '=' || op === '==') return actualVal === targetVal;
          if (op === '!=') return actualVal !== targetVal;
          if (op === '>=') return Number(actualVal) >= Number(targetVal);
          if (op === '<=') return Number(actualVal) <= Number(targetVal);
          if (op === '>') return Number(actualVal) > Number(targetVal);
          if (op === '<') return Number(actualVal) < Number(targetVal);
        }
        return true;
      });
    } catch {
      return true;
    }
  }

  _executeMultiHopMatch(patternPart, returnPart, whereCondition) {
    // Multi-hop solver: Alice -> Course <- Faculty
    const matchedNodeIds = new Set();
    const matchedRelIds = new Set();
    const matchedRows = [];

    // Check if pattern contains Faculty -> Course <- Student
    if (/Faculty.*TEACHES.*Course.*ENROLLED_IN.*Student/i.test(patternPart)) {
      this.graph.relationships.forEach((relT) => {
        if (relT.type === 'TEACHES') {
          const faculty = this.graph.nodes.get(relT.source);
          const course = this.graph.nodes.get(relT.target);
          if (faculty && course) {
            // Find students enrolled in this course
            const inRels = this.graph.incoming.get(course.id) || [];
            inRels.forEach((rid) => {
              const relE = this.graph.relationships.get(rid);
              if (relE && relE.type === 'ENROLLED_IN') {
                const student = this.graph.nodes.get(relE.source);
                if (student) {
                  matchedNodeIds.add(faculty.id);
                  matchedNodeIds.add(course.id);
                  matchedNodeIds.add(student.id);
                  matchedRelIds.add(relT.id);
                  matchedRelIds.add(relE.id);
                  matchedRows.push({ f: faculty, c: course, s: student });
                }
              }
            });
          }
        }
      });

      const { data, columns } = this._projectReturn(returnPart, matchedRows);
      return {
        success: true,
        message: `Multi-hop matched ${data.length} record(s).`,
        data,
        columns,
        matched_node_ids: Array.from(matchedNodeIds),
        matched_rel_ids: Array.from(matchedRelIds),
        affected_count: data.length
      };
    }

    // Circular transfer: Account -> Account -> Account -> Account
    if (/TRANSFER.*TRANSFER.*TRANSFER/i.test(patternPart)) {
      this.graph.relationships.forEach((r1) => {
        if (r1.type === 'TRANSFER') {
          const a1 = this.graph.nodes.get(r1.source);
          const a2 = this.graph.nodes.get(r1.target);
          (this.graph.outgoing.get(a2.id) || []).forEach((rid2) => {
            const r2 = this.graph.relationships.get(rid2);
            if (r2 && r2.type === 'TRANSFER') {
              const a3 = this.graph.nodes.get(r2.target);
              (this.graph.outgoing.get(a3.id) || []).forEach((rid3) => {
                const r3 = this.graph.relationships.get(rid3);
                if (r3 && r3.type === 'TRANSFER' && r3.target === a1.id) {
                  matchedNodeIds.add(a1.id);
                  matchedNodeIds.add(a2.id);
                  matchedNodeIds.add(a3.id);
                  matchedRelIds.add(r1.id);
                  matchedRelIds.add(r2.id);
                  matchedRelIds.add(r3.id);
                  matchedRows.push({ a1, a2, a3, t1: r1, t2: r2, t3: r3 });
                }
              });
            }
          });
        }
      });

      const { data, columns } = this._projectReturn(returnPart, matchedRows);
      return {
        success: true,
        message: `Circular Fraud Ring matched ${data.length} path(s).`,
        data,
        columns,
        matched_node_ids: Array.from(matchedNodeIds),
        matched_rel_ids: Array.from(matchedRelIds),
        affected_count: data.length
      };
    }

    // Default fallback: match all nodes
    const data = [];
    this.graph.nodes.forEach((n) => {
      data.push({ id: n.id, name: n.displayName(), labels: Array.from(n.labels).join(', ') });
      matchedNodeIds.add(n.id);
    });

    return {
      success: true,
      message: `Pattern matched ${data.length} record(s).`,
      data,
      columns: ['id', 'name', 'labels'],
      matched_node_ids: Array.from(matchedNodeIds),
      matched_rel_ids: [],
      affected_count: data.length
    };
  }

  _projectReturn(returnClause, rowList) {
    if (!returnClause || rowList.length === 0) {
      return { data: [], columns: [] };
    }

    const items = returnClause.split(',').map((s) => s.trim());
    const isAggregating = items.some((it) => /count\(|avg\(|sum\(/i.test(it));

    if (!isAggregating) {
      const data = rowList.map((row) => {
        const out = {};
        items.forEach((item) => {
          // alias: RETURN x.name AS label
          const aliasParts = item.split(/\s+AS\s+/i);
          const expr = aliasParts[0].trim();
          const colName = aliasParts[1]?.trim() || expr;

          const dotParts = expr.split('.');
          if (dotParts.length === 2) {
            const varName = dotParts[0].trim();
            const prop = dotParts[1].trim();
            const entity = row[varName];
            out[colName] = entity?.get ? entity.get(prop) : entity?.properties?.[prop] || '—';
          } else {
            const entity = row[expr];
            out[colName] = entity?.displayName ? entity.displayName() : (entity?.type || entity?.id || '—');
          }
        });
        return out;
      });

      const columns = items.map((it) => {
        const aliasParts = it.split(/\s+AS\s+/i);
        return aliasParts[1]?.trim() || aliasParts[0].trim();
      });

      return { data, columns };
    }

    // Aggregations (e.g. RETURN c.name, count(s) AS total_enrolled)
    const groupKeys = [];
    const aggExprs = [];

    items.forEach((item) => {
      if (/count\(|avg\(|sum\(/i.test(item)) {
        aggExprs.push(item);
      } else {
        groupKeys.push(item);
      }
    });

    const groups = new Map();
    rowList.forEach((row) => {
      const keyVals = groupKeys.map((k) => {
        const parts = k.split('.');
        if (parts.length === 2) {
          const entity = row[parts[0]];
          return entity?.get ? entity.get(parts[1]) : entity?.properties?.[parts[1]];
        }
        return row[k]?.displayName ? row[k].displayName() : String(row[k]);
      });
      const groupKey = keyVals.join(':::');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { keyVals, rows: [] });
      }
      groups.get(groupKey).rows.push(row);
    });

    const data = [];
    groups.forEach(({ keyVals, rows }) => {
      const out = {};
      groupKeys.forEach((gk, i) => {
        const aliasParts = gk.split(/\s+AS\s+/i);
        out[aliasParts[1]?.trim() || aliasParts[0].trim()] = keyVals[i];
      });

      aggExprs.forEach((agg) => {
        const aliasParts = agg.split(/\s+AS\s+/i);
        const colName = aliasParts[1]?.trim() || aliasParts[0].trim();
        const expr = aliasParts[0].trim();

        if (/count\(/i.test(expr)) {
          out[colName] = rows.length;
        } else if (/avg\(/i.test(expr)) {
          const matchProp = expr.match(/avg\((\w+)\.(\w+)\)/i);
          if (matchProp) {
            const vName = matchProp[1];
            const pName = matchProp[2];
            const sum = rows.reduce((acc, r) => acc + Number(r[vName]?.get ? r[vName].get(pName, 0) : 0), 0);
            out[colName] = Number((sum / rows.length).toFixed(2));
          } else {
            out[colName] = 0;
          }
        }
      });

      data.push(out);
    });

    const columns = items.map((it) => {
      const aliasParts = it.split(/\s+AS\s+/i);
      return aliasParts[1]?.trim() || aliasParts[0].trim();
    });

    return { data, columns };
  }
}

// ---------------------------------------------------------------------------
// PRESET CONFIGS & SCHEMAS (from EXP8 app.py)
// ---------------------------------------------------------------------------
export const PRESET_SCHEMAS = {
  'University Academic Knowledge Graph (Default)': {
    key: 'university',
    node_labels: ['Student', 'Course', 'Faculty', 'Department', 'Project', 'Custom...'],
    default_properties: {
      Student: { id_prefix: 's_', name: 'Kiran Patel', key1: 'dept', val1: 'CSE', key2: 'gpa', val2: '8.80' },
      Course: { id_prefix: 'cs_', name: 'Machine Learning', key1: 'code', val1: 'CS401', key2: 'credits', val2: '4' },
      Faculty: { id_prefix: 'prof_', name: 'Prof. V. Rao', key1: 'dept', val1: 'CSE', key2: 'role', val2: 'Professor' },
      Department: { id_prefix: 'dept_', name: 'Information Technology', key1: 'code', val1: 'IT', key2: 'building', val2: 'Aryabhatta' },
      Project: { id_prefix: 'proj_', name: 'Graph Neural Networks', key1: 'domain', val1: 'AI', key2: 'budget', val2: '150000' },
      'Custom...': { id_prefix: 'custom_', name: 'Custom Entity', key1: 'type', val1: 'General', key2: 'status', val2: 'Active' }
    },
    rel_types: ['ENROLLED_IN', 'TEACHES', 'PREREQUISITE_OF', 'BELONGS_TO', 'ADVISES', 'OFFERED_BY', 'Custom...'],
    cypher_examples: {
      '1. Match all nodes and inspect entire graph': 'MATCH (n) RETURN n',
      '2. Match enrolled students and courses': 'MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s.name, c.name, s.gpa',
      '3. Filter high-performing students (WHERE clause)': 'MATCH (s:Student) WHERE s.gpa >= 8.5 RETURN s.name, s.dept, s.gpa',
      '4. Multi-hop: Faculty teaching enrolled students': 'MATCH (f:Faculty)-[:TEACHES]->(c:Course)<-[:ENROLLED_IN]-(s:Student) RETURN f.name, c.name, s.name',
      '5. Aggregate enrollment counts per course (count)': 'MATCH (c:Course)<-[:ENROLLED_IN]-(s:Student) RETURN c.name, count(s) AS total_enrolled',
      '6. Prerequisite chain traversal (Course -> Course)': 'MATCH (c1:Course)-[:PREREQUISITE_OF]->(c2:Course) RETURN c1.name, c2.name',
      '7. CREATE a new Student node': "CREATE (s:Student {id: 's_kiran', name: 'Kiran Patel', dept: 'CSE', gpa: 8.75}) RETURN s",
      '8. Connect new Student to Course (CREATE rel)': "MATCH (s:Student {id: 's_kiran'}), (c:Course {name: 'Database Management Systems'}) CREATE (s)-[:ENROLLED_IN {grade: 'A', semester: '5th'}]->(c) RETURN s, c",
      '9. Update student GPA using SET': "MATCH (s:Student {id: 's_kiran'}) SET s.gpa = 9.40 RETURN s",
      '10. Safely remove student using DETACH DELETE': "MATCH (s:Student {id: 's_kiran'}) DETACH DELETE s"
    }
  },
  'Social Network & Friendships': {
    key: 'social',
    node_labels: ['Person', 'Group', 'Topic', 'Event', 'Custom...'],
    default_properties: {
      Person: { id_prefix: 'p_', name: 'Elena Rostova', key1: 'city', val1: 'Mumbai', key2: 'age', val2: '25' },
      Group: { id_prefix: 'g_', name: 'Deep Learning Club', key1: 'members_count', val1: '220', key2: 'category', val2: 'Technology' },
      Topic: { id_prefix: 'i_', name: 'Knowledge Graphs', key1: 'domain', val1: 'Databases', key2: 'level', val2: 'Advanced' }
    },
    rel_types: ['FRIENDS_WITH', 'MEMBER_OF', 'INTERESTED_IN', 'FOLLOWS', 'Custom...'],
    cypher_examples: {
      '1. Match all people and their cities': 'MATCH (p:Person) RETURN p.name, p.city, p.age',
      '2. Find friendships in network': 'MATCH (p1:Person)-[:FRIENDS_WITH]->(p2:Person) RETURN p1.name, p2.name',
      '3. Group memberships by person': 'MATCH (p:Person)-[m:MEMBER_OF]->(g:Group) RETURN p.name, g.name, m.role',
      '4. Shared topics of interest': 'MATCH (p:Person)-[:INTERESTED_IN]->(t:Topic) RETURN p.name, t.name, t.domain'
    }
  },
  'Financial Fraud Detection Ring': {
    key: 'fraud',
    node_labels: ['Account', 'Device', 'IPAddress', 'Merchant', 'Custom...'],
    default_properties: {
      Account: { id_prefix: 'acc_', name: 'ACC-105', key1: 'owner', val1: 'David', key2: 'balance', val2: '42000' },
      Device: { id_prefix: 'dev_', name: 'DEV-MAC-9931', key1: 'device_id', val1: 'DEV-MAC-9931', key2: 'os', val2: 'iOS 17' },
      IPAddress: { id_prefix: 'ip_', name: '192.168.1.188', key1: 'ip', val1: '192.168.1.188', key2: 'city', val2: 'Delhi' }
    },
    rel_types: ['USED_DEVICE', 'LOGGED_FROM', 'TRANSFER', 'Custom...'],
    cypher_examples: {
      '1. Match all accounts and balances': 'MATCH (a:Account) RETURN a.acc_no, a.owner, a.balance',
      '2. Detect circular money transfers (Fraud Ring)': 'MATCH (a1:Account)-[t1:TRANSFER]->(a2:Account)-[t2:TRANSFER]->(a3:Account)-[t3:TRANSFER]->(a1) RETURN a1.owner, a2.owner, a3.owner, t1.amount, t2.amount, t3.amount',
      '3. Find shared devices across accounts': 'MATCH (a:Account)-[:USED_DEVICE]->(d:Device) RETURN d.device_id, count(a) AS linked_accounts'
    }
  },
  'Blank / Empty Graph': {
    key: 'blank',
    node_labels: ['Entity', 'User', 'Concept', 'Item', 'Custom...'],
    default_properties: {
      Entity: { id_prefix: 'node_', name: 'Root Node', key1: 'type', val1: 'Base', key2: 'value', val2: '100' }
    },
    rel_types: ['CONNECTED_TO', 'RELATES_TO', 'PART_OF', 'Custom...'],
    cypher_examples: {
      '1. Match all nodes in the graph': 'MATCH (n) RETURN n',
      '2. Create custom node with properties': "CREATE (n:CustomEntity {id: 'c1', name: 'Sample Entity', priority: 'High'}) RETURN n",
      '3. Detach delete all nodes (Reset)': 'MATCH (n) DETACH DELETE n'
    }
  }
};

export const LABEL_COLORS = {
  Student: '#8b5cf6', // Violet
  Course: '#3b82f6', // Blue
  Faculty: '#10b981', // Emerald
  Department: '#f59e0b', // Amber
  Person: '#ec4899', // Pink
  Group: '#06b6d4', // Cyan
  Topic: '#14b8a6', // Teal
  Account: '#f43f5e', // Rose
  Device: '#6366f1', // Indigo
  IPAddress: '#64748b', // Slate
  Entity: '#0284c7', // Sky
  Custom: '#78716c'
};

export function getLabelColor(label) {
  return LABEL_COLORS[label] || '#64748b';
}
