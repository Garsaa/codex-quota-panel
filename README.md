# Codex Limits

Extensão complementar para VS Code que mostra o limite restante do Codex nas janelas de 5 horas e semanal, os horários de reset e a quantidade de resets guardados.

O painel **Limites** aparece na mesma barra lateral do Codex. O item da barra de status mostra os percentuais. A consulta é feita a cada minuto; o botão de atualizar força uma nova leitura. Se houver resets guardados, clicar nesse item abre [Codex Settings → Usage & Billing](https://chatgpt.com/codex/settings/usage).

## Instalar em outro computador

1. Instale a extensão oficial **Codex** (`openai.chatgpt`) e faça login nela.
2. Baixe este repositório privado ou apenas o arquivo `dist/codex-quota-panel-0.2.0.vsix`.
3. Execute `code --install-extension dist/codex-quota-panel-0.2.0.vsix --force` na pasta do repositório. No VS Code, também é possível usar **Extensions → … → Install from VSIX**.
4. Recarregue a janela do VS Code e abra o painel **Limites** ao lado do chat do Codex.

## Funcionamento

A extensão inicia o executável local incluído na extensão oficial do Codex e consulta `account/rateLimits/read` no app server. Não armazena credenciais nem envia os limites a terceiros. O link de Usage & Billing abre o site do Codex somente quando clicado.

Essa interface do app server pode mudar em versões futuras do Codex. A versão atual foi verificada em Linux x64; os caminhos do executável para Windows e macOS ainda precisam de validação nesses sistemas.

## Gerar o VSIX

Com Node.js e npm instalados:

```sh
npm exec --yes --package @vscode/vsce -- vsce package --no-dependencies --out dist/codex-quota-panel-0.2.0.vsix
```
