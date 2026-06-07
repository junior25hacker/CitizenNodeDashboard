/**
 * ThemeManager.js
 * ===============
 * Manages dark/light mode toggle, persisting preference to localStorage.
 *
 * OOP Concepts Applied:
 *  - Encapsulation: current theme stored privately
 *  - Single Responsibility: only handles theme state and DOM side-effects
 */

'use strict';

class ThemeManager {
  /** @type {'dark'|'light'} */
  #current;

  /** @type {string} localStorage key */
  static #STORAGE_KEY = 'citizennode-theme';

  constructor() {
    const saved = localStorage.getItem(ThemeManager.#STORAGE_KEY);
    this.#current = saved === 'light' ? 'light' : 'dark';
    this.#apply();
  }

  get theme() { return this.#current; }

  toggle() {
    this.#current = this.#current === 'dark' ? 'light' : 'dark';
    this.#apply();
    localStorage.setItem(ThemeManager.#STORAGE_KEY, this.#current);
  }

  #apply() {
    document.documentElement.setAttribute('data-theme', this.#current);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', String(this.#current === 'light'));
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = this.#current === 'dark' ? '☀️' : '🌙';
  }
}
