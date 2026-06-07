/**
 * Widget.js
 * =========
 * Abstract Widget class extending Component.
 *
 * OOP Concepts Applied:
 *  - Inheritance  : extends Component
 *  - Abstraction  : defines contract for all concrete widgets
 *  - Polymorphism : subclasses override getTitle() and buildBody()
 */

'use strict';

class Widget extends Component {
  /** @type {string} */
  #title;

  /** @type {string} */
  #icon;

  /**
   * @param {string} id
   * @param {string} title  Human-readable widget title
   * @param {string} [icon] Unicode emoji or icon character
   * @param {Object} [state]
   */
  constructor(id, title, icon = '📊', state = {}) {
    super(id, state);
    if (new.target === Widget) {
      throw new Error('Widget is abstract and cannot be instantiated directly.');
    }
    this.#title = title;
    this.#icon  = icon;
  }

  get title() { return this.#title; }
  get icon()  { return this.#icon;  }

  // ─────────────────────────────────────────────
  // Template method — defines shared card shell
  // ─────────────────────────────────────────────

  /**
   * Builds and returns the body content of this widget.
   * @abstract
   * @returns {HTMLElement}
   */
  buildBody() {
    throw new Error(`${this.constructor.name}.buildBody() must be implemented.`);
  }

  /**
   * render() assembles the shared glass-card shell and injects buildBody().
   * @override
   * @returns {HTMLElement}
   */
  render() {
    const card = document.createElement('div');
    card.className = 'widget-card glass-card';
    card.setAttribute('data-widget-id', this.id);

    // Header
    const header = document.createElement('div');
    header.className = 'widget-header';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'widget-icon';
    iconSpan.textContent = this.#icon;

    const titleEl = document.createElement('h3');
    titleEl.className = 'widget-title';
    titleEl.textContent = this.#title;

    header.appendChild(iconSpan);
    header.appendChild(titleEl);

    // Body
    const body = document.createElement('div');
    body.className = 'widget-body';
    body.appendChild(this.buildBody());

    card.appendChild(header);
    card.appendChild(body);
    return card;
  }
}
