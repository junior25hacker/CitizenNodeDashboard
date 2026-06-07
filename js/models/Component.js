/**
 * Component.js
 * ============
 * Abstract base class following OOP principles.
 * Every UI component in the dashboard MUST extend this class.
 *
 * OOP Concepts Applied:
 *  - Abstraction  : defines interface methods (init, render, update, destroy)
 *  - Encapsulation: private state held in #state field
 *  - Inheritance  : subclasses extend and override lifecycle methods
 */

'use strict';

class Component {
  /** @type {HTMLElement|null} */
  #container = null;

  /** @type {Object} */
  #state = {};

  /** @type {string} */
  #id;

  /**
   * @param {string} id       Unique component identifier
   * @param {Object} [state]  Initial state
   */
  constructor(id, state = {}) {
    if (new.target === Component) {
      throw new Error('Component is abstract and cannot be instantiated directly.');
    }
    this.#id = id;
    this.#state = { ...state };
  }

  // ─────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────

  get id() { return this.#id; }

  get container() { return this.#container; }

  /** Read-only snapshot of current state */
  get state() { return { ...this.#state }; }

  // ─────────────────────────────────────────────
  // State management
  // ─────────────────────────────────────────────

  /**
   * Merge partial update into state and trigger re-render.
   * @param {Object} partial
   */
  setState(partial) {
    this.#state = { ...this.#state, ...partial };
    this.update(this.#state);
  }

  // ─────────────────────────────────────────────
  // Lifecycle — subclasses MUST override render()
  // ─────────────────────────────────────────────

  /**
   * Called once after mounting. Set up event listeners here.
   */
  init() {}

  /**
   * Return an HTMLElement representing the component.
   * @abstract
   * @returns {HTMLElement}
   */
  render() {
    throw new Error(`${this.constructor.name}.render() must be implemented.`);
  }

  /**
   * Called when state changes. Subclasses can override for partial updates.
   * Default behaviour is a full re-render.
   * @param {Object} _newState
   */
  update(_newState) {
    if (!this.#container) return;
    const freshEl = this.render();
    this.#container.innerHTML = '';
    this.#container.appendChild(freshEl);
    this.init();
  }

  /**
   * Mount the component into a DOM container element.
   * @param {HTMLElement} container
   */
  mount(container) {
    this.#container = container;
    const el = this.render();
    container.appendChild(el);
    this.init();
  }

  /**
   * Remove the component from the DOM and clean up.
   */
  destroy() {
    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }
  }
}
