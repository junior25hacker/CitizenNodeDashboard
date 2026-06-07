/**
 * DataService.js
 * ==============
 * Service class for fetching dashboard data.
 * Configured to use static mock data by default; swap `#useMock`
 * to false and set `#apiBase` to your real API URL when ready.
 *
 * OOP Concepts Applied:
 *  - Encapsulation: private fields hide implementation details
 *  - Single Responsibility: only handles data fetching and caching
 */

'use strict';

class DataService {
  /** @type {boolean} Set to false when real API is available */
  #useMock = true;

  /** @type {string} Base URL for the real API */
  #apiBase = 'https://api.citizennode.example.com/v1';

  /** @type {Map<string, {data: any, expiresAt: number}>} Simple in-memory cache */
  #cache = new Map();

  /** Cache TTL in milliseconds (30 seconds) */
  #cacheTTL = 30_000;

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  /**
   * Fetch the dashboard summary metrics.
   * @returns {Promise<Object>}
   */
  async getSummaryMetrics() {
    return this.#request('summary', () => this.#mockSummaryMetrics());
  }

  /**
   * Fetch the node list.
   * @returns {Promise<Object[]>}
   */
  async getNodes() {
    return this.#request('nodes', () => this.#mockNodes());
  }

  /**
   * Fetch historical traffic data for the line chart.
   * @returns {Promise<{labels: string[], data: number[]}>}
   */
  async getTrafficHistory() {
    return this.#request('traffic', () => this.#mockTrafficHistory());
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  async #request(key, mockFn) {
    // Check cache
    if (this.#cache.has(key)) {
      const entry = this.#cache.get(key);
      if (Date.now() < entry.expiresAt) return entry.data;
    }

    let data;
    if (this.#useMock) {
      // Simulate network latency
      await this.#delay(300 + Math.random() * 200);
      data = mockFn();
    } else {
      const response = await fetch(`${this.#apiBase}/${key}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      data = await response.json();
    }

    this.#cache.set(key, { data, expiresAt: Date.now() + this.#cacheTTL });
    return data;
  }

  #delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─────────────────────────────────────────────
  // Mock data generators
  // ─────────────────────────────────────────────

  #mockSummaryMetrics() {
    return {
      totalNodes:    { value: 1_284,  unit: 'nodes',  trend:  +4.2, subLabel: 'Active across all zones' },
      uptime:        { value: 99.7,   unit: '%',       trend:  +0.1, subLabel: 'System uptime last 30 days' },
      pendingIssues: { value: 23,     unit: 'issues',  trend: -12.5, subLabel: 'Awaiting citizen response' },
      resolvedToday: { value: 118,    unit: 'resolved',trend: +31.0, subLabel: 'Requests closed today' },
    };
  }

  #mockNodes() {
    const statuses = ['Active', 'Idle', 'Offline', 'Maintenance'];
    const zones    = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    const types    = ['Gateway', 'Relay', 'Edge', 'Hub'];
    return Array.from({ length: 24 }, (_, i) => ({
      id:       `NODE-${String(i + 1).padStart(4, '0')}`,
      name:     `CitizenNode ${i + 1}`,
      zone:     zones[i % zones.length],
      type:     types[i % types.length],
      status:   statuses[Math.floor(Math.random() * statuses.length)],
      load:     `${(30 + Math.random() * 65).toFixed(1)}%`,
      lastSeen: this.#randomTimestamp(),
    }));
  }

  #mockTrafficHistory() {
    const now    = new Date();
    const labels = [];
    const data   = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleString('default', { month: 'short' }));
      data.push(Math.floor(800 + Math.random() * 600));
    }
    return { labels, data };
  }

  #randomTimestamp() {
    const minsAgo = Math.floor(Math.random() * 120);
    if (minsAgo < 1)  return 'Just now';
    if (minsAgo < 60) return `${minsAgo}m ago`;
    return `${Math.floor(minsAgo / 60)}h ago`;
  }
}
