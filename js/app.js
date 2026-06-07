/**
 * app.js
 * ======
 * Application bootstrap — wires together Dashboard, DataService,
 * ThemeManager, and all Widget instances.
 *
 * OOP Concepts Applied:
 *  - Composition  : App composes Dashboard, DataService, ThemeManager
 *  - Factory      : creates concrete Widget subclasses
 *  - Separation of concerns: bootstrapping is isolated here
 */

'use strict';

(async () => {
  // ── Instantiate core services ──────────────────
  const dataService  = new DataService();
  const dashboard    = new Dashboard(dataService);
  const themeManager = new ThemeManager();

  // ── Wire theme toggle button ───────────────────
  document.getElementById('theme-toggle')
    ?.addEventListener('click', () => themeManager.toggle());

  document.getElementById('settings-theme-btn')
    ?.addEventListener('click', () => themeManager.toggle());

  // ── Sidebar navigation ─────────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(`section-${target}`)?.classList.add('active');
    });
  });

  // ── Register stat widgets ──────────────────────
  const statDefs = [
    { id: 'totalNodes',    title: 'Total Nodes',      icon: '🌐', color: '#6366f1',
      initial: { value: '—', unit: 'nodes',   trend: 0, subLabel: 'Loading…' } },
    { id: 'uptime',        title: 'System Uptime',    icon: '💚', color: '#22c55e',
      initial: { value: '—', unit: '%',        trend: 0, subLabel: 'Loading…' } },
    { id: 'pendingIssues', title: 'Pending Issues',   icon: '⚠️', color: '#f59e0b',
      initial: { value: '—', unit: 'issues',  trend: 0, subLabel: 'Loading…' } },
    { id: 'resolvedToday', title: 'Resolved Today',   icon: '✅', color: '#10b981',
      initial: { value: '—', unit: 'resolved',trend: 0, subLabel: 'Loading…' } },
  ];

  statDefs.forEach(({ id, title, icon, initial }) => {
    const widget    = new StatWidget(id, title, icon, initial);
    const container = document.getElementById(`widget-${id}`);
    if (container) dashboard.addWidget(widget, container);
  });

  // ── Register chart widget ──────────────────────
  const chartWidget = new ChartWidget('trafficChart', 'Request Traffic (Monthly)', '📈', {
    data: [], labels: [], color: '#6366f1',
  });
  const chartContainer = document.getElementById('widget-trafficChart');
  if (chartContainer) dashboard.addWidget(chartWidget, chartContainer);

  // ── Register table widget ──────────────────────
  const tableWidget = new TableWidget('nodeTable', 'Node Directory', '🗂️', {
    columns: [
      { key: 'id',       label: 'Node ID'   },
      { key: 'name',     label: 'Name'      },
      { key: 'zone',     label: 'Zone'      },
      { key: 'type',     label: 'Type'      },
      { key: 'status',   label: 'Status'    },
      { key: 'load',     label: 'Load'      },
      { key: 'lastSeen', label: 'Last Seen' },
    ],
    rows: [],
  });
  const tableContainer = document.getElementById('widget-nodeTable');
  if (tableContainer) dashboard.addWidget(tableWidget, tableContainer);

  // ── Initial data load ──────────────────────────
  document.getElementById('refresh-btn')
    ?.addEventListener('click', () => dashboard.refresh());

  await dashboard.refresh();
  dashboard.startPolling(30_000);

  // ── Animate stat cards entrance ───────────────
  document.querySelectorAll('.widget-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
    card.classList.add('animate-in');
  });
})();
