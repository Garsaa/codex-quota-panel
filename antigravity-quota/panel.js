const { randomBytes } = require('node:crypto');

function panelHtml() {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 12px 14px 14px; background: var(--vscode-sideBar-background, var(--vscode-editor-background)); color: var(--vscode-foreground); font: 13px var(--vscode-font-family); }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    .heading { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--vscode-descriptionForeground); }
    button { font: inherit; cursor: pointer; }
    .refresh { border: 0; padding: 2px 6px; background: transparent; color: var(--vscode-textLink-foreground); border-radius: 4px; }
    .refresh:hover { background: var(--vscode-toolbar-hoverBackground); }
    .refresh:focus-visible, .credits a:focus-visible, .tab:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
    .tabs { display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; }
    .tab { border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.28)); background: transparent; color: var(--vscode-descriptionForeground); font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 12px; transition: all .15s ease; white-space: nowrap; }
    .tab:hover { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
    .tab.active { background: #a855f7; color: #ffffff; border-color: #a855f7; font-weight: 600; }
    .quota + .quota { margin-top: 14px; }
    .line { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .label { font-weight: 600; }
    .value { font-size: 18px; line-height: 1.1; font-weight: 600; font-variant-numeric: tabular-nums; }
    .unit { font-size: 11px; font-weight: 400; color: var(--vscode-descriptionForeground); }
    .track { height: 6px; overflow: hidden; margin-top: 6px; border-radius: 99px; background: rgba(128, 128, 128, .28); }
    .fill { height: 100%; width: 0; border-radius: inherit; background: #a855f7; transition: width .25s ease; }
    .reset { min-height: 14px; margin: 4px 0 0; color: var(--vscode-descriptionForeground); font-size: 11px; }
    .footer { border-top: 1px solid var(--vscode-panel-border); margin-top: 14px; padding-top: 8px; color: var(--vscode-descriptionForeground); font-size: 11px; }
    .credits { display: flex; justify-content: space-between; gap: 10px; }
    .credits a { color: var(--vscode-textLink-foreground); text-decoration: none; }
    .credits a:hover { text-decoration: underline; }
    .updated { margin-top: 4px; }
    .notice { margin-top: 6px; color: var(--vscode-errorForeground); }
    [hidden] { display: none !important; }
  </style>
</head>
<body>
  <div class="top"><h1 class="heading">Limites do Antigravity</h1><button class="refresh" id="refresh" type="button" title="Atualizar limites">Atualizar</button></div>
  <div class="tabs" id="tabs" hidden></div>
  <main aria-live="polite">
    <section class="quota" aria-label="Limite de 5 horas">
      <div class="line"><span class="label">5 horas</span><span class="value"><span id="five-value">—</span><span class="unit"> restante</span></span></div>
      <div class="track" id="five-track" role="progressbar" aria-label="Limite restante em 5 horas" aria-valuemin="0" aria-valuemax="100"><div class="fill" id="five-fill"></div></div>
      <p class="reset" id="five-reset">Consultando…</p>
    </section>
    <section class="quota" aria-label="Limite semanal">
      <div class="line"><span class="label">Semana</span><span class="value"><span id="week-value">—</span><span class="unit"> restante</span></span></div>
      <div class="track" id="week-track" role="progressbar" aria-label="Limite semanal restante" aria-valuemin="0" aria-valuemax="100"><div class="fill" id="week-fill"></div></div>
      <p class="reset" id="week-reset">Consultando…</p>
    </section>
  </main>
  <footer class="footer">
    <div class="credits"><span>Créditos de IA</span><span id="credits">—</span></div>
    <div class="updated" id="updated"></div>
    <div class="notice" id="notice" role="status" hidden></div>
  </footer>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const byId = (id) => document.getElementById(id);
    let currentGroups = [];
    let selectedGroupIndex = 0;

    byId('refresh').addEventListener('click', () => vscode.postMessage({ type: 'refresh' }));
    byId('credits').addEventListener('click', (event) => {
      if (event.target.closest('a')) { event.preventDefault(); vscode.postMessage({ type: 'upgrade' }); }
    });

    function showWindow(prefix, data) {
      const percent = data?.remaining;
      byId(prefix + '-value').textContent = percent == null ? '—' : percent + '%';
      byId(prefix + '-fill').style.width = percent == null ? '0%' : percent + '%';
      const track = byId(prefix + '-track');
      if (percent == null) track.removeAttribute('aria-valuenow');
      else track.setAttribute('aria-valuenow', String(percent));
      byId(prefix + '-reset').textContent = data?.reset || 'Horário de reset indisponível';
    }

    function renderGroup(group) {
      if (!group) return;
      showWindow('five', group.five);
      showWindow('week', group.week);
    }

    function renderTabs(groups) {
      const tabsContainer = byId('tabs');
      tabsContainer.replaceChildren();
      if (!groups || groups.length <= 1) {
        tabsContainer.hidden = true;
        return;
      }
      tabsContainer.hidden = false;
      groups.forEach((group, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tab' + (index === selectedGroupIndex ? ' active' : '');
        btn.textContent = group.label || group.name || 'Grupo ' + (index + 1);
        btn.addEventListener('click', () => {
          selectedGroupIndex = index;
          Array.from(tabsContainer.children).forEach((el, i) => {
            el.classList.toggle('active', i === index);
          });
          renderGroup(currentGroups[selectedGroupIndex]);
        });
        tabsContainer.appendChild(btn);
      });
    }

    window.addEventListener('message', ({ data }) => {
      if (data.type !== 'snapshot') return;
      currentGroups = data.groups || [];
      if (selectedGroupIndex >= currentGroups.length) selectedGroupIndex = 0;
      renderTabs(currentGroups);
      renderGroup(currentGroups[selectedGroupIndex]);

      const credits = byId('credits');
      credits.replaceChildren();
      if (data.credits !== null && data.credits !== undefined) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = String(data.credits) + ' · Ver detalhes';
        credits.append(link);
      } else {
        credits.textContent = '—';
      }
      byId('updated').textContent = data.updated ? 'Atualizado às ' + data.updated : '';
      const notice = byId('notice');
      notice.textContent = data.error || '';
      notice.hidden = !data.error;
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
}

module.exports = { panelHtml };
