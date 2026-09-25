const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');
const vscode = require('vscode');
const { panelHtml } = require('./panel');

const POLL_INTERVAL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_UPGRADE_URL = 'https://antigravity.google/g1-upgrade';

function findAgyBinary() {
  const customPath = vscode.workspace.getConfiguration('antigravityQuota').get('cliPath');
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  const agySetting = vscode.workspace.getConfiguration('antigravity').get('cliPath');
  if (agySetting && agySetting !== 'agy' && fs.existsSync(agySetting)) {
    return agySetting;
  }

  const isWin = process.platform === 'win32';
  const binName = isWin ? 'agy.exe' : 'agy';

  const pathDirs = (process.env.PATH || '').split(path.delimiter);
  for (const dir of pathDirs) {
    if (!dir) continue;
    const candidate = path.join(dir, binName);
    if (fs.existsSync(candidate)) return candidate;
  }

  const home = os.homedir();
  const candidates = isWin
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'agy', binName),
        path.join(home, 'AppData', 'Local', 'Programs', 'agy', binName),
        path.join(home, '.local', 'bin', binName),
      ]
    : [
        path.join(home, '.local', 'bin', binName),
        path.join('/usr', 'local', 'bin', binName),
        path.join('/usr', 'bin', binName),
      ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return binName;
}

function runAgyCommand(args) {
  return new Promise((resolve, reject) => {
    const binary = findAgyBinary();
    execFile(binary, args, { timeout: REQUEST_TIMEOUT_MS }, (error, stdout, stderr) => {
      if (error) {
        const msg = stderr?.trim() || error.message || 'Falha ao executar o CLI do Antigravity.';
        return reject(new Error(msg));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (parseError) {
        reject(new Error('Resposta inválida do CLI do Antigravity.'));
      }
    });
  });
}

function formatReset(dateStr) {
  if (!dateStr) return 'horário indisponível';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'horário indisponível';
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function timeUntilReset(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 60_000));
  if (minutes === 0) return 'agora';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days) return `em ${days}d ${hours}h`;
  if (hours) return `em ${hours}h ${rest}min`;
  return `em ${rest}min`;
}

function normalize(usageResult, creditsResult) {
  const groupsRaw = usageResult?.command?.data?.groups || [];
  const groups = groupsRaw.map((group) => {
    const buckets = group.buckets || [];
    const fiveBucket = buckets.find((b) => b.window === '5h' || b.id?.includes('5h'))
      || buckets[1] || buckets[0];
    const weekBucket = buckets.find((b) => b.window === 'weekly' || b.id?.includes('weekly'))
      || buckets[0];

    const toWindow = (b) => {
      if (!b) return null;
      const frac = Number(b.remaining_fraction);
      const remaining = Number.isFinite(frac) ? Math.max(0, Math.min(100, Math.round(frac * 100))) : null;
      const resetTime = b.reset_time;
      return {
        remaining,
        resetDate: resetTime,
        reset: resetTime ? `Reinicia ${timeUntilReset(resetTime)} · ${formatReset(resetTime)}` : 'Horário indisponível',
      };
    };

    let label = group.name;
    if (/gemini/i.test(group.name)) label = 'Gemini';
    else if (/claude/i.test(group.name)) label = 'Claude & GPT';

    return {
      name: group.name,
      label,
      description: group.description,
      five: toWindow(fiveBucket),
      week: toWindow(weekBucket),
    };
  });

  const creditsData = creditsResult?.command?.data;
  return {
    groups,
    credits: creditsData?.remaining_credits ?? null,
    upgradeUrl: creditsData?.upgrade_uri || DEFAULT_UPGRADE_URL,
    updatedAt: new Date(),
  };
}

class AntigravityQuotaProvider {
  constructor(onAction) {
    this.onAction = onAction;
    this.views = new Set();
    this.snapshot = null;
    this.error = null;
  }

  resolveWebviewView(view) {
    view.webview.options = { enableScripts: true };
    view.webview.html = panelHtml();
    this.views.add(view);
    view.onDidDispose(() => this.views.delete(view));
    view.webview.onDidReceiveMessage((message) => {
      if (message.type === 'ready') this.send(view);
      else if (message.type === 'refresh' || message.type === 'upgrade') this.onAction(message.type);
    });
  }

  update(snapshot, error = null) {
    this.snapshot = snapshot;
    this.error = error;
    for (const view of this.views) this.send(view);
  }

  send(view) {
    const data = this.snapshot;
    void view.webview.postMessage({
      type: 'snapshot',
      groups: data?.groups ?? [],
      credits: data?.credits ?? null,
      updated: data?.updatedAt?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) ?? null,
      error: this.error,
    });
  }
}

function updateStatusBar(statusBar, snapshot, error) {
  if (!snapshot || !snapshot.groups || snapshot.groups.length === 0) {
    statusBar.text = '$(dashboard) AGY: limites indisponíveis';
    statusBar.tooltip = error || 'Consultando os limites do Antigravity…';
    return;
  }

  const primary = snapshot.groups.find((g) => /gemini/i.test(g.name)) || snapshot.groups[0];
  const five = primary.five?.remaining;
  const week = primary.week?.remaining;
  statusBar.text = `$(dashboard) AGY 5h ${five ?? '—'}% · 7d ${week ?? '—'}%`;

  const lines = [
    `Antigravity (${primary.label || primary.name})`,
    `5h: ${five ?? '—'}% restante; ${primary.five?.reset || 'indisponível'}`,
    `Semana: ${week ?? '—'}% restante; ${primary.week?.reset || 'indisponível'}`,
  ];
  if (snapshot.credits !== null && snapshot.credits !== undefined) {
    lines.push(`Créditos de IA: ${snapshot.credits}`);
  }
  lines.push(`Atualizado: ${snapshot.updatedAt.toLocaleTimeString('pt-BR')}`);
  if (error) {
    lines.push(`Falha na última atualização: ${error}`);
  }
  lines.push('Clique para atualizar.');
  statusBar.tooltip = lines.join('\n');
}

function activate(context) {
  let upgradeUrl = DEFAULT_UPGRADE_URL;
  const provider = new AntigravityQuotaProvider((action) => {
    if (action === 'refresh') refresh();
    if (action === 'upgrade') vscode.env.openExternal(vscode.Uri.parse(upgradeUrl));
  });

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  statusBar.command = 'antigravityQuota.refresh';
  statusBar.show();

  context.subscriptions.push(
    statusBar,
    vscode.window.registerWebviewViewProvider('antigravityQuotaView', provider),
    vscode.window.registerWebviewViewProvider('antigravityQuotaSidebarView', provider),
    vscode.window.registerWebviewViewProvider('antigravityQuotaExplorerView', provider),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('antigravityQuota.openPanel', () => {
      vscode.commands.executeCommand('antigravityQuotaView.focus');
    }),
  );

  let snapshot = null;
  let inFlight = null;

  const refresh = () => {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const [usageRes, creditsRes] = await Promise.allSettled([
          runAgyCommand(['-p', '/usage', '--output-format', 'json']),
          runAgyCommand(['-p', '/credits', '--output-format', 'json']),
        ]);

        if (usageRes.status === 'rejected') {
          throw usageRes.reason;
        }

        const usageData = usageRes.value;
        const creditsData = creditsRes.status === 'fulfilled' ? creditsRes.value : null;

        snapshot = normalize(usageData, creditsData);
        if (snapshot.upgradeUrl) upgradeUrl = snapshot.upgradeUrl;
        provider.update(snapshot, null);
        updateStatusBar(statusBar, snapshot, null);
      } catch (error) {
        const message = error?.message || 'Falha ao consultar limites do Antigravity.';
        provider.update(snapshot, message);
        updateStatusBar(statusBar, snapshot, message);
      }
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  context.subscriptions.push(vscode.commands.registerCommand('antigravityQuota.refresh', refresh));
  context.subscriptions.push(vscode.commands.registerCommand('antigravityQuota.openUpgrade', () => {
    return vscode.env.openExternal(vscode.Uri.parse(upgradeUrl));
  }));

  const timer = setInterval(refresh, POLL_INTERVAL_MS);
  context.subscriptions.push({ dispose: () => clearInterval(timer) });
  refresh();
}

module.exports = { activate, findAgyBinary, normalize };
