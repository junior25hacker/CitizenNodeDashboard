/**
 * TableWidget.js
 * ==============
 * Concrete widget that renders a sortable, searchable data table.
 *
 * OOP Concepts Applied:
 *  - Inheritance  : extends Widget → extends Component
 *  - Encapsulation: sort state is private; exposed via setState()
 *  - Polymorphism : overrides buildBody() and init()
 */

'use strict';

class TableWidget extends Widget {
  /** @type {string}  column key currently sorted */
  #sortKey = null;

  /** @type {'asc'|'desc'} */
  #sortDir = 'asc';

  /**
   * @param {string} id
   * @param {string} title
   * @param {string} icon
   * @param {Object} state
   * @param {Object[]} state.rows     Array of row objects
   * @param {Object[]} state.columns  Array of {key, label} column descriptors
   */
  constructor(id, title, icon, state) {
    super(id, title, icon, state);
  }

  /**
   * @override
   * @returns {HTMLElement}
   */
  buildBody() {
    const { rows = [], columns = [] } = this.state;

    const wrapper = document.createElement('div');
    wrapper.className = 'table-widget';

    // ── Search bar ─────────────────────────────
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.className = 'table-search';
    searchBar.placeholder = '🔍  Search nodes…';
    searchBar.id = `search-${this.id}`;

    // ── Table ──────────────────────────────────
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-scroll';

    const table = document.createElement('table');
    table.className = 'data-table';
    table.id = `table-${this.id}`;

    // THEAD
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.setAttribute('data-col', col.key);
      th.className = 'table-th sortable';
      if (this.#sortKey === col.key) {
        th.classList.add(this.#sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // TBODY
    const tbody = document.createElement('tbody');
    const sorted = this.#getSortedRows(rows);
    sorted.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      columns.forEach(col => {
        const td = document.createElement('td');
        td.className = 'table-td';

        // Special render for 'status' column
        if (col.key === 'status') {
          const badge = document.createElement('span');
          badge.className = `status-badge status-${(row[col.key] || '').toLowerCase()}`;
          badge.textContent = row[col.key];
          td.appendChild(badge);
        } else {
          td.textContent = row[col.key] ?? '—';
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(searchBar);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  /** @override */
  init() {
    if (!this.container) return;
    const searchInput = this.container.querySelector(`#search-${this.id}`);
    const tableEl     = this.container.querySelector(`#table-${this.id}`);

    if (searchInput && tableEl) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        tableEl.querySelectorAll('tbody tr').forEach(tr => {
          tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    // Sort on header click
    if (tableEl) {
      tableEl.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.getAttribute('data-col');
          if (this.#sortKey === key) {
            this.#sortDir = this.#sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            this.#sortKey = key;
            this.#sortDir = 'asc';
          }
          this.setState({}); // re-render with new sort
        });
      });
    }
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  #getSortedRows(rows) {
    if (!this.#sortKey) return [...rows];
    return [...rows].sort((a, b) => {
      const av = a[this.#sortKey];
      const bv = b[this.#sortKey];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return this.#sortDir === 'asc' ? cmp : -cmp;
    });
  }
}
