/**
 * DonutChartWidget.js
 * ===================
 * Doughnut chart for Approved vs Rejected ratio.
 *
 * OOP Concepts:
 *  - Inheritance  : extends Widget
 *  - Polymorphism : overrides buildBody() and init()
 *  - Encapsulation: Chart.js instance private
 */
'use strict';

class DonutChartWidget extends Widget {
  #stats;
  #chartInstance = null;
  #canvasId;

  constructor(id, stats) {
    super(id, 'Verification Ratio', '🍩');
    this.#stats    = stats;
    this.#canvasId = `donut-canvas-${id}`;
  }

  /** @override */
  buildBody() {
    const { approvedCount, rejectedCount, pendingCount } = this.#stats;
    const total = approvedCount + rejectedCount + pendingCount;

    const frag = document.createDocumentFragment();

    const subtitle = document.createElement('p');
    subtitle.className = 'chart-panel-subtitle';
    subtitle.textContent = 'All-time breakdown';
    frag.appendChild(subtitle);

    const wrap = document.createElement('div');
    wrap.className = 'chart-canvas-wrap';
    wrap.style.height = '160px';
    wrap.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.id = this.#canvasId;
    wrap.appendChild(canvas);

    // Centred label
    const center = document.createElement('div');
    center.className = 'donut-center-label';
    const pct = Math.round((approvedCount / total) * 100);
    center.innerHTML = `<div class="donut-center-value">${pct}%</div>
                        <div class="donut-center-text">Approval</div>`;
    wrap.appendChild(center);
    frag.appendChild(wrap);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    const items = [
      { color:'#34D399', label:`Approved`, count: approvedCount.toLocaleString() },
      { color:'#F87171', label:`Rejected`, count: rejectedCount.toLocaleString() },
      { color:'#FBBF24', label:`Pending`,  count: pendingCount.toLocaleString()  },
    ];
    items.forEach(({ color, label, count }) => {
      const item = document.createElement('div');
      item.className = 'donut-legend-item';
      item.innerHTML = `<span class="legend-dot" style="background:${color}"></span>
                        <span style="flex:1">${label}</span>
                        <span style="color:#F0F6FF;font-weight:600">${count}</span>`;
      legend.appendChild(item);
    });
    frag.appendChild(legend);
    return frag;
  }

  /** @override */
  render() {
    const panel = document.createElement('div');
    panel.id = `donut-${this.id}`;

    const header = document.createElement('div');
    header.className = 'chart-panel-header';
    const title = document.createElement('div');
    title.className = 'chart-panel-title';
    title.textContent = this.title;
    header.appendChild(title);
    panel.appendChild(header);
    panel.appendChild(this.buildBody());
    return panel;
  }

  /** @override */
  init() {
    const canvas = document.getElementById(this.#canvasId);
    if (!canvas) return;
    if (this.#chartInstance) { this.#chartInstance.destroy(); }

    const { approvedCount, rejectedCount, pendingCount } = this.#stats;

    this.#chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Rejected', 'Pending'],
        datasets: [{
          data: [approvedCount, rejectedCount, pendingCount],
          backgroundColor: ['#34D399', '#F87171', '#FBBF24'],
          hoverBackgroundColor: ['#6EE7B7', '#FCA5A5', '#FCD34D'],
          borderColor: '#0D1528',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,21,40,0.92)',
            borderColor: 'rgba(96,165,250,0.2)',
            borderWidth: 1,
            titleColor: '#F0F6FF',
            bodyColor: '#94A3B8',
            padding: 10,
          }
        },
        animation: { animateRotate: true, duration: 1000, easing: 'easeOutQuart' }
      }
    });
  }
}
