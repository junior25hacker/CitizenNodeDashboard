/**
 * ActivityChartWidget.js
 * ======================
 * Bar/line chart showing daily verification activity.
 *
 * OOP Concepts:
 *  - Inheritance  : extends Widget
 *  - Polymorphism : overrides buildBody() and init()
 *  - Encapsulation: Chart.js instance private
 */
'use strict';

class ActivityChartWidget extends Widget {
  #chartData;
  #chartInstance = null;
  #canvasId;

  constructor(id, chartData) {
    super(id, 'Verification Activity', '📈');
    this.#chartData = chartData;
    this.#canvasId  = `canvas-${id}`;
  }

  /** @override */
  buildBody() {
    const frag = document.createDocumentFragment();

    const subtitle = document.createElement('p');
    subtitle.className = 'chart-panel-subtitle';
    subtitle.textContent = 'Daily approved vs rejected · last 7 days';

    const wrap = document.createElement('div');
    wrap.className = 'chart-canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.id = this.#canvasId;
    wrap.appendChild(canvas);
    frag.appendChild(subtitle);
    frag.appendChild(wrap);
    return frag;
  }

  /** @override — custom header layout */
  render() {
    const panel = document.createElement('div');
    panel.id = `chart-${this.id}`;

    const header = document.createElement('div');
    header.className = 'chart-panel-header';

    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'chart-panel-title';
    title.textContent = this.title;
    left.appendChild(title);

    header.appendChild(left);

    panel.appendChild(header);
    panel.appendChild(this.buildBody());
    return panel;
  }

  /** @override — initialise Chart.js after DOM mount */
  init() {
    const canvas = document.getElementById(this.#canvasId);
    if (!canvas) return;

    // Destroy previous instance if re-rendered
    if (this.#chartInstance) { this.#chartInstance.destroy(); }

    const { labels, approved, rejected } = this.#chartData;

    const gradient = (ctx, color) => {
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0,   color + 'BB');
      g.addColorStop(1,   color + '11');
      return g;
    };

    this.#chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Approved',
            data: approved,
            backgroundColor: (ctx) => gradient(ctx.chart.ctx, '#34D399'),
            borderColor: '#34D399',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Rejected',
            data: rejected,
            backgroundColor: (ctx) => gradient(ctx.chart.ctx, '#F87171'),
            borderColor: '#F87171',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: '#94A3B8',
              font: { family: 'Outfit', size: 12 },
              boxWidth: 10,
              borderRadius: 3,
              useBorderRadius: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(13,21,40,0.92)',
            borderColor: 'rgba(96,165,250,0.2)',
            borderWidth: 1,
            titleColor: '#F0F6FF',
            bodyColor: '#94A3B8',
            padding: 10,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#94A3B8', font: { family: 'Outfit', size: 12 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#94A3B8', font: { family: 'Outfit', size: 12 } },
            beginAtZero: true
          }
        },
        animation: { duration: 800, easing: 'easeOutQuart' }
      }
    });
  }
}
