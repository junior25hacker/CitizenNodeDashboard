/**
 * ChartWidget.js
 * ==============
 * Concrete widget that renders a line chart using the Canvas 2D API.
 *
 * OOP Concepts Applied:
 *  - Inheritance  : extends Widget → extends Component
 *  - Encapsulation: chart drawing logic is private to this class
 *  - Polymorphism : overrides buildBody() and init()
 */

'use strict';

class ChartWidget extends Widget {
  /** @type {HTMLCanvasElement|null} */
  #canvas = null;

  /**
   * @param {string} id
   * @param {string} title
   * @param {string} icon
   * @param {Object} state
   * @param {number[]} state.data    Array of numeric data points
   * @param {string[]} state.labels  Array of label strings
   * @param {string}   state.color  Line colour (CSS colour string)
   */
  constructor(id, title, icon, state) {
    super(id, title, icon, state);
  }

  /**
   * @override
   * @returns {HTMLElement}
   */
  buildBody() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';

    this.#canvas = document.createElement('canvas');
    this.#canvas.className = 'chart-canvas';
    this.#canvas.setAttribute('aria-label', `${this.title} chart`);
    this.#canvas.setAttribute('role', 'img');

    wrapper.appendChild(this.#canvas);
    return wrapper;
  }

  /**
   * Draw the chart after mount/update.
   * @override
   */
  init() {
    if (!this.#canvas) return;
    this.#drawChart();
  }

  // ─────────────────────────────────────────────
  // Private drawing helpers
  // ─────────────────────────────────────────────

  #drawChart() {
    const canvas = this.#canvas;
    const { data = [], labels = [], color = '#7c3aed' } = this.state;

    // Size canvas to its display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr || 400 * dpr;
    canvas.height = rect.height * dpr || 180 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = canvas.width  / dpr;
    const H = canvas.height / dpr;
    const pad = { top: 20, right: 20, bottom: 36, left: 40 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top  - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    if (!data.length) return;

    const maxVal = Math.max(...data) || 1;
    const minVal = Math.min(...data);

    const xStep = innerW / (data.length - 1 || 1);

    // ── Grid lines ─────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (innerH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + innerW, y);
      ctx.stroke();
    }

    // ── Gradient fill ──────────────────────────
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + innerH);
    gradient.addColorStop(0,   this.#hexToRgba(color, 0.45));
    gradient.addColorStop(1,   this.#hexToRgba(color, 0.01));

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    // Close fill path
    ctx.lineTo(pad.left + (data.length - 1) * xStep, pad.top + innerH);
    ctx.lineTo(pad.left, pad.top + innerH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // ── Line ───────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';
    data.forEach((v, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ── Data points ────────────────────────────
    data.forEach((v, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // ── X-axis labels ──────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = pad.left + i * xStep;
      ctx.fillText(label, x, H - 6);
    });

    // ── Y-axis labels ──────────────────────────
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = minVal + ((maxVal - minVal) / 4) * (4 - i);
      const y = pad.top + (innerH / 4) * i + 4;
      ctx.fillText(Math.round(value), pad.left - 6, y);
    }
  }

  #hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
