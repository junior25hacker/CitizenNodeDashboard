/**
 * DataService.js
 * ==============
 * OOP Concepts Applied:
 *  - Encapsulation : all data logic hidden behind public API
 *  - Single Responsibility : one class, one concern (data)
 *  - Dependency Injection  : can swap mock vs real adapter
 *
 * By default uses MockAdapter (static JSON data).
 * Swap to ApiAdapter by passing a real base URL.
 */
'use strict';

/* ──────────────────────────────────────
   Mock Data Definitions
────────────────────────────────────── */
const MOCK_DB = {
  stats: {
    totalCitizens:  148_430,
    pendingCount:   1_247,
    approvedCount:  139_620,
    rejectedCount:   7_563,
    activeNodes:       312,
    weeklyGrowth:    +4.7,   // %
    pendingDelta:    -12.3,  // %
  },

  activityChart: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    approved: [310, 445, 392, 510, 478, 280, 198],
    rejected:  [42,  58,  37,  61,  55,  28,  19],
  },

  nodes: [
    { id:'ND-001', name:'James Okoye',    natId:'NG-20451-A', dob:'1988-03-14', hospital:'Lagos State Hospital',     status:'approved', submittedAt:'2026-06-06 09:12' },
    { id:'ND-002', name:'Aisha Musa',     natId:'NG-31820-B', dob:'1995-07-22', hospital:'Kano General Clinic',      status:'pending',  submittedAt:'2026-06-07 11:05' },
    { id:'ND-003', name:'Emeka Chukwu',   natId:'NG-40892-C', dob:'1979-11-08', hospital:'Enugu Teaching Hospital',  status:'rejected', submittedAt:'2026-06-05 14:30' },
    { id:'ND-004', name:'Fatima Bello',   natId:'NG-52314-D', dob:'2001-01-17', hospital:'Abuja National Medical',   status:'pending',  submittedAt:'2026-06-07 08:48' },
    { id:'ND-005', name:'Chidi Obi',      natId:'NG-63401-E', dob:'1993-09-03', hospital:'Port Harcourt Med Ctr',   status:'approved', submittedAt:'2026-06-04 16:22' },
    { id:'ND-006', name:'Ngozi Eze',      natId:'NG-74562-F', dob:'1986-05-29', hospital:'Owerri District Hospital', status:'approved', submittedAt:'2026-06-03 10:11' },
    { id:'ND-007', name:'Suleiman Dada',  natId:'NG-85730-G', dob:'1974-12-15', hospital:'Sokoto Fed Medical Ctr',  status:'pending',  submittedAt:'2026-06-07 13:00' },
    { id:'ND-008', name:'Bola Adeyemi',   natId:'NG-96801-H', dob:'1999-08-20', hospital:'Ibadan UCH',              status:'rejected', submittedAt:'2026-06-06 17:45' },
    { id:'ND-009', name:'Uche Nwachukwu', natId:'NG-10923-I', dob:'1982-02-07', hospital:'Anambra State Hospital',  status:'approved', submittedAt:'2026-06-02 12:30' },
    { id:'ND-010', name:'Halima Garba',   natId:'NG-21046-J', dob:'1991-04-11', hospital:'Kaduna Fed Clinic',       status:'pending',  submittedAt:'2026-06-07 07:15' },
    { id:'ND-011', name:'Tunde Badmus',   natId:'NG-32167-K', dob:'2000-06-19', hospital:'Ogun State Medical Ctr',  status:'approved', submittedAt:'2026-06-01 09:05' },
    { id:'ND-012', name:'Amaka Okonkwo',  natId:'NG-43281-L', dob:'1987-10-02', hospital:'Delta State Hospital',    status:'pending',  submittedAt:'2026-06-07 12:35' },
  ],

  activityFeed: [
    { type:'approved', name:'James Okoye',    msg:'Identity verified successfully.', time:'2 min ago' },
    { type:'rejected', name:'Emeka Chukwu',   msg:'Document mismatch — flagged.',    time:'14 min ago' },
    { type:'pending',  name:'Aisha Musa',     msg:'Awaiting document review.',       time:'28 min ago' },
    { type:'approved', name:'Chidi Obi',      msg:'All checks passed.',              time:'1 hr ago' },
    { type:'info',     name:'System',         msg:'Node cluster NG-Lagos synced.',   time:'1 hr ago' },
    { type:'rejected', name:'Bola Adeyemi',   msg:'Duplicate record detected.',      time:'3 hr ago' },
    { type:'approved', name:'Ngozi Eze',      msg:'Biometric confirmation OK.',      time:'5 hr ago' },
    { type:'info',     name:'System',         msg:'Daily backup completed.',         time:'8 hr ago' },
  ],

  nodeMap: [
    { label:'Lagos',     x:0.18, y:0.55, status:'active',   count:42 },
    { label:'Abuja',     x:0.43, y:0.44, status:'active',   count:31 },
    { label:'Kano',      x:0.43, y:0.22, status:'active',   count:28 },
    { label:'Port Harcourt', x:0.30, y:0.62, status:'flagged', count:15 },
    { label:'Enugu',     x:0.40, y:0.55, status:'active',   count:22 },
    { label:'Ibadan',    x:0.22, y:0.50, status:'active',   count:19 },
    { label:'Sokoto',    x:0.28, y:0.14, status:'inactive', count: 8 },
    { label:'Kaduna',    x:0.37, y:0.32, status:'active',   count:24 },
    { label:'Maiduguri', x:0.65, y:0.20, status:'inactive', count: 5 },
    { label:'Calabar',   x:0.50, y:0.62, status:'active',   count:11 },
  ],

  settings: {
    notifications:    true,
    autoRefresh:      true,
    refreshInterval:  30,
    twoFactor:        false,
    auditLog:         true,
    compactView:      false,
  }
};

/* ──────────────────────────────────────
   Adapter Interface (for polymorphism)
────────────────────────────────────── */
class MockAdapter {
  /** Simulate async fetch with short delay */
  async fetch(endpoint) {
    await new Promise(r => setTimeout(r, 120 + Math.random() * 180));
    if (!(endpoint in MOCK_DB)) throw new Error(`No mock data for "${endpoint}"`);
    return structuredClone(MOCK_DB[endpoint]);
  }
}

class ApiAdapter {
  #baseUrl;
  constructor(baseUrl) { this.#baseUrl = baseUrl.replace(/\/$/, ''); }
  async fetch(endpoint) {
    const res = await fetch(`${this.#baseUrl}/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${endpoint}`);
    return res.json();
  }
}

/* ──────────────────────────────────────
   DataService  (Encapsulated Facade)
────────────────────────────────────── */
class DataService {
  #adapter;

  /**
   * @param {string|null} apiBaseUrl  Pass null to use mock data.
   */
  constructor(apiBaseUrl = null) {
    this.#adapter = apiBaseUrl ? new ApiAdapter(apiBaseUrl) : new MockAdapter();
  }

  async getStats()         { return this.#adapter.fetch('stats'); }
  async getActivityChart() { return this.#adapter.fetch('activityChart'); }
  async getNodes()         { return this.#adapter.fetch('nodes'); }
  async getActivityFeed()  { return this.#adapter.fetch('activityFeed'); }
  async getNodeMap()       { return this.#adapter.fetch('nodeMap'); }
  async getSettings()      { return this.#adapter.fetch('settings'); }

  /** Simulate save (mock always resolves) */
  async saveSettings(data) {
    await new Promise(r => setTimeout(r, 200));
    Object.assign(MOCK_DB.settings, data);
    return { ok: true };
  }

  /** Simulate verify action */
  async verifyNode(nodeId) {
    await new Promise(r => setTimeout(r, 350));
    const node = MOCK_DB.nodes.find(n => n.id === nodeId);
    if (node) node.status = 'approved';
    MOCK_DB.stats.approvedCount++;
    if (node?.status === 'pending') MOCK_DB.stats.pendingCount--;
    return { ok: true };
  }

  /** Simulate reject action */
  async rejectNode(nodeId) {
    await new Promise(r => setTimeout(r, 350));
    const node = MOCK_DB.nodes.find(n => n.id === nodeId);
    if (node) node.status = 'rejected';
    MOCK_DB.stats.rejectedCount++;
    if (node?.status === 'pending') MOCK_DB.stats.pendingCount--;
    return { ok: true };
  }
}
