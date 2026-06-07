/**
 * StatWidget.js
 * =============
 * Concrete widget that displays a single statistic (number + label + trend).
 *
 * OOP Concepts Applied:
 *  - Inheritance  : extends Widget → extends Component
 *  - Encapsulation: stores metric data as private state
 *  - Polymorphism : overrides buildBody() to produce a stat card
 */

'use strict';

class StatWidget extends Widget {
  /**
   * @param {string} id
   * @param {string} title
   * @param {string} icon
   * @param {Object} state
   * @param {number|string} state.value    Primary metric value
   * @param {string}        state.unit     Unit label (e.g. '%', 'nodes')
   * @param {number}        state.trend    Percentage change (positive = up)
   * @param {string}        state.subLabel Secondary descriptive label
   */
  constructor(id, title, icon, state) {
    super(id, title, icon, state);
  }

  /**
   * @override
   * @returns {HTMLElement}
   */
  buildBody() {
    const { value, unit, trend, subLabel } = this.state;

    const wrapper = document.createElement('div');
    wrapper.className = 'stat-widget';

    // Value row
    const valueRow = document.createElement('div');
    valueRow.className = 'stat-value-row';

    const valueEl = document.createElement('span');
    valueEl.className = 'stat-value';
    valueEl.textContent = value;

    const unitEl = document.createElement('span');
    unitEl.className = 'stat-unit';
    unitEl.textContent = unit;

    valueRow.appendChild(valueEl);
    valueRow.appendChild(unitEl);

    // Trend badge
    const trendEl = document.createElement('span');
    const isUp = trend >= 0;
    trendEl.className = `stat-trend ${isUp ? 'trend-up' : 'trend-down'}`;
    trendEl.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(trend)}%`;

    // Sub-label
    const subEl = document.createElement('p');
    subEl.className = 'stat-sub-label';
    subEl.textContent = subLabel || '';

    wrapper.appendChild(valueRow);
    wrapper.appendChild(trendEl);
    wrapper.appendChild(subEl);
    return wrapper;
  }
}
