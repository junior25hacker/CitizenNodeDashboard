/**
 * NodeMapWidget.js
 * ================
 * Canvas-based node status map showing geographic distribution.
 *
 * OOP Concepts:
 *  - Inheritance  : extends Widget
 *  - Polymorphism : overrides buildBody() and init()
 *  - Encapsulation: Canvas 2D context private
 */
'use strict';

class NodeMapWidget extends Widget {
  #nodes;
  #canvasId;
  #animFrame = null;
  #pulsePhase = 0;

  constructor(id, nodes) {
    super(id, 'Node Status Map', '◉');
    this.#nodes   = nodes;
    this.#canvasId = `map-canvas-${id}`;
  }

  /** @override */
  buildBody() {
    const frag = document.createDocumentFragment();

    const canvas = document.createElement('canvas');
    canvas.id     = this.#canvasId;
    canvas.className = 'map-canvas';
    canvas.height = 220;
    frag.appendChild(canvas);

    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `
      <div class="map-legend-item"><span class="map-dot active"></span>Active</div>
      <div class="map-legend-item"><span class="map-dot inactive"></span>Inactive</div>
      <div class="map-legend-item"><span class="map-dot flagged"></span>Flagged</div>
    `;
    frag.appendChild(legend);
    return frag;
  }

  /** @override */
  render() {
    const panel = document.createElement('div');
    panel.className = 'map-panel';
    panel.id = `map-${this.id}`;

    const header = document.createElement('div');
    header.className = 'map-header';
    const title = document.createElement('div');
    title.className = 'map-title';
    title.textContent = this.title;
    header.appendChild(title);

    const countBadge = document.createElement('div');
    countBadge.style.cssText = 'font-size:12px;color:#94A3B8;';
    countBadge.textContent = `${this.#nodes.length} nodes`;
    header.appendChild(countBadge);

    panel.appendChild(header);
    panel.appendChild(this.buildBody());
    return panel;
  }

  /** @override */
  init() {
    const canvas = document.getElementById(this.#canvasId);
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 400;
    this.#startAnimation(canvas);
  }

  #startAnimation(canvas) {
    if (this.#animFrame) cancelAnimationFrame(this.#animFrame);
    const ctx  = canvas.getContext('2d');
    const W    = canvas.width;
    const H    = canvas.height;

    const draw = () => {
      this.#pulsePhase = (this.#pulsePhase + 0.04) % (Math.PI * 2);
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(96,165,250,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Connection lines between active nodes
      const active = this.#nodes.filter(n => n.status === 'active');
      ctx.strokeStyle = 'rgba(52,211,153,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < active.length - 1; i++) {
        const a = active[i], b = active[i + 1];
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H);
        ctx.lineTo(b.x * W, b.y * H);
        ctx.stroke();
      }

      // Draw nodes
      this.#nodes.forEach(node => {
        const nx = node.x * W;
        const ny = node.y * H;

        const colorMap = { active:'#34D399', inactive:'#475569', flagged:'#FBBF24' };
        const color    = colorMap[node.status] || '#94A3B8';

        // Pulsing ring for active nodes
        if (node.status === 'active') {
          const pulse = 0.5 + 0.5 * Math.sin(this.#pulsePhase + node.x * 5);
          ctx.beginPath();
          ctx.arc(nx, ny, 10 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = color + '40';
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }

        // Main dot
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + 16);
      });

      this.#animFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  destroy() {
    if (this.#animFrame) cancelAnimationFrame(this.#animFrame);
    super.destroy();
  }
}
