/**
 * ActivityFeedWidget.js
 * =====================
 * Live scrollable feed of recent verification events.
 *
 * OOP Concepts:
 *  - Inheritance  : extends Widget
 *  - Polymorphism : overrides buildBody() and init()
 *  - Encapsulation: internal DOM refs private
 */
'use strict';

class ActivityFeedWidget extends Widget {
  #items;
  #listEl = null;
  #intervalId = null;

  constructor(id, items) {
    super(id, 'Recent Activity', '≋');
    this.#items = items;
  }

  #buildItem(item) {
    const li = document.createElement('div');
    li.className = 'feed-item';

    const dot = document.createElement('span');
    dot.className = `feed-dot ${item.type}`;

    const body = document.createElement('div');
    body.style.flex = '1';

    const text = document.createElement('div');
    text.className = 'feed-text';
    text.innerHTML = `<span class="feed-name">${item.name}</span> – ${item.msg}`;

    const time = document.createElement('div');
    time.className = 'feed-time';
    time.textContent = item.time;

    body.appendChild(text);
    body.appendChild(time);
    li.appendChild(dot);
    li.appendChild(body);
    return li;
  }

  /** @override */
  buildBody() {
    const frag = document.createDocumentFragment();

    const listEl = document.createElement('div');
    listEl.className = 'feed-list';
    listEl.id = `feed-list-${this.id}`;

    this.#items.forEach(item => listEl.appendChild(this.#buildItem(item)));
    frag.appendChild(listEl);
    return frag;
  }

  /** @override — full panel render */
  render() {
    const panel = document.createElement('div');
    panel.className = 'feed-panel';
    panel.id = `feed-${this.id}`;

    const header = document.createElement('div');
    header.className = 'feed-header';

    const title = document.createElement('div');
    title.className = 'feed-title';
    title.textContent = this.title;

    const badge = document.createElement('div');
    badge.style.cssText = 'font-size:12px;color:#94A3B8;';
    badge.textContent = `${this.#items.length} events`;

    header.appendChild(title);
    header.appendChild(badge);
    panel.appendChild(header);
    panel.appendChild(this.buildBody());
    return panel;
  }

  /** @override — start simulated live feed */
  init() {
    this.#listEl = document.getElementById(`feed-list-${this.id}`);
    if (!this.#listEl) return;

    // Simulate new event every 8 seconds
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#intervalId = setInterval(() => this.#pushFakeEvent(), 8000);
  }

  destroy() {
    if (this.#intervalId) clearInterval(this.#intervalId);
    super.destroy();
  }

  #pushFakeEvent() {
    if (!this.#listEl) return;
    const types  = ['approved', 'pending', 'info'];
    const names  = ['Musa Ibrahim', 'Chioma Ada', 'Tayo Alabi', 'Yemi Ola'];
    const msgs   = ['Document uploaded.', 'Pending manual review.', 'Node synced.'];
    const type   = types[Math.floor(Math.random() * types.length)];
    const item   = {
      type,
      name: names[Math.floor(Math.random() * names.length)],
      msg:  msgs[Math.floor(Math.random() * msgs.length)],
      time: 'just now',
    };
    const el = this.#buildItem(item);
    this.#listEl.prepend(el);

    // Cap at 12 items
    while (this.#listEl.children.length > 12) {
      this.#listEl.removeChild(this.#listEl.lastChild);
    }
  }
}
