/**
 * StatWidget.js
 * =============
 * Concrete widget rendering a KPI stat card.
 *
 * OOP Concepts:
 *  - Inheritance  : extends Widget → Component
 *  - Polymorphism : overrides buildBody()
 *  - Encapsulation: internal formatter hidden
 */
'use strict';

class StatWidget extends Widget {
  #value;
  #delta;
  #deltaType;
  #accentA;
  #accentB;

  /**
   * @param {string} id
   * @param {string} title
   * @param {string} icon
   * @param {number} value
   * @param {string} delta    e.g. '+4.7%'
   * @param {'up'|'down'|'neutral'} deltaType
   * @param {string} accentA  CSS colour (gradient start)
   * @param {string} accentB  CSS colour (gradient end)
   */
  constructor(id, title, icon, value, delta, deltaType, accentA, accentB) {
    super(id, title, icon, {});
    this.#value     = value;
    this.#delta     = delta;
    this.#deltaType = deltaType;
    this.#accentA   = accentA;
    this.#accentB   = accentB;
  }

  /** Format large numbers with locale separators */
  #format(n) {
    return n.toLocaleString('en-NG');
  }

  /** @override */
  buildBody() {
    const frag = document.createDocumentFragment();

    const valueEl = document.createElement('div');
    valueEl.className = 'stat-card-value';
    valueEl.id = `stat-value-${this.id}`;
    // animate count-up
    StatWidget.#countUp(valueEl, this.#value, this.#format.bind(this));

    const deltaEl = document.createElement('div');
    deltaEl.className = `stat-card-delta delta-${this.#deltaType}`;
    const arrow = this.#deltaType === 'up' ? '▲' : this.#deltaType === 'down' ? '▼' : '–';
    deltaEl.textContent = `${arrow} ${this.#delta} vs last week`;

    frag.appendChild(valueEl);
    frag.appendChild(deltaEl);
    return frag;
  }

  /** @override — render the whole card with custom gradient vars */
  render() {
    const card = document.createElement('div');
    card.className = 'stat-card glass-card';
    card.id = `stat-card-${this.id}`;
    card.style.setProperty('--card-accent-a', this.#accentA);
    card.style.setProperty('--card-accent-b', this.#accentB);

    // Header
    const header = document.createElement('div');
    header.className = 'stat-card-header';

    const label = document.createElement('div');
    label.className = 'stat-card-label';
    label.textContent = this.title;

    const iconEl = document.createElement('div');
    iconEl.className = 'stat-card-icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = this.icon;

    header.appendChild(label);
    header.appendChild(iconEl);

    card.appendChild(header);
    card.appendChild(this.buildBody());
    return card;
  }

  /** Animate count-up from 0 to target */
  static #countUp(el, target, formatter) {
    const duration = 900;
    const start    = performance.now();
    const update   = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatter(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
}
