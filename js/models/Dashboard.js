/**
 * Dashboard.js
 * ============
 * Top-level orchestrator that manages all widgets.
 *
 * OOP Concepts Applied:
 *  - Aggregation  : Dashboard owns a collection of Widget instances
 *  - Single Responsibility : only coordinates layout and data refresh
 *  - Encapsulation: widget registry is private
 */

'use strict';

class Dashboard {
  /** @type {Map<string, Widget>} */
  #widgets = new Map();

  /** @type {DataService} */
  #dataService;

  /** @type {number|null} polling interval handle */
  #pollHandle = null;

  /**
   * @param {DataService} dataService
   */
  constructor(dataService) {
    this.#dataService = dataService;
  }

  // ─────────────────────────────────────────────
  // Widget registry
  // ─────────────────────────────────────────────

  /**
   * Register a widget with a target container selector.
   * @param {Widget}      widget
   * @param {HTMLElement} container
   */
  addWidget(widget, container) {
    this.#widgets.set(widget.id, widget);
    widget.mount(container);
  }

  /**
   * @param {string} id
   * @returns {Widget|undefined}
   */
  getWidget(id) {
    return this.#widgets.get(id);
  }

  // ─────────────────────────────────────────────
  // Data refresh
  // ─────────────────────────────────────────────

  /**
   * Fetch fresh data from DataService and push to all relevant widgets.
   * @returns {Promise<void>}
   */
  async refresh() {
    try {
      const [metrics, nodes, traffic] = await Promise.all([
        this.#dataService.getSummaryMetrics(),
        this.#dataService.getNodes(),
        this.#dataService.getTrafficHistory(),
      ]);

      // Push to stat widgets
      for (const [key, metric] of Object.entries(metrics)) {
        const widget = this.#widgets.get(key);
        if (widget) widget.setState(metric);
      }

      // Push to node table
      const tableWidget = this.#widgets.get('nodeTable');
      if (tableWidget) tableWidget.setState({ rows: nodes });

      // Push to chart
      const chartWidget = this.#widgets.get('trafficChart');
      if (chartWidget) chartWidget.setState(traffic);

      // Update last-refresh timestamp
      const el = document.getElementById('last-refresh');
      if (el) el.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    } catch (err) {
      console.error('[Dashboard] refresh error:', err);
    }
  }

  /**
   * Start auto-refreshing every `intervalMs` milliseconds.
   * @param {number} intervalMs
   */
  startPolling(intervalMs = 30_000) {
    this.stopPolling();
    this.#pollHandle = setInterval(() => this.refresh(), intervalMs);
  }

  /** Stop auto-refreshing. */
  stopPolling() {
    if (this.#pollHandle !== null) {
      clearInterval(this.#pollHandle);
      this.#pollHandle = null;
    }
  }
}
