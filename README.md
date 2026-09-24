# 🧩 Extensões dos Cria

**Extensões pequenas, úteis e feitas pra deixar o VS Code mais do seu jeito.**

Este repositório reúne projetos independentes: **uma extensão por pasta**, cada uma com seu próprio código, manifesto, documentação e versão.

## ✨ Catálogo

| Extensão | Pasta | O que faz |
| --- | --- | --- |
| **Codex Quota** | [codex-quota/](codex-quota/) | Mostra o uso restante e os horários de reset do Codex dentro do VS Code. |

## 🚀 Instalar o Codex Quota

1. Instale a extensão oficial **Codex** (openai.chatgpt) e entre na sua conta.
2. Baixe [codex-quota-panel-0.3.2.vsix](codex-quota/dist/codex-quota-panel-0.3.2.vsix).
3. No terminal, na raiz deste repositório, execute:

   ~~~sh
   code --install-extension codex-quota/dist/codex-quota-panel-0.3.2.vsix --force
   ~~~

   Ou no VS Code: **Extensions** → **…** → **Install from VSIX…**.
4. Recarregue a janela e abra o painel **Limites** junto ao Codex.

## 💡 O que ela mostra

- Limite restante nas janelas de **5 horas** e **1 semana**.
- Percentuais, barras de progresso e horários de reset.
- Resets guardados e horário da última leitura.
- Atualização automática a cada minuto e botão para atualizar na hora.
- Resumo dos limites na barra de status.

## 🛠️ Empacotar para desenvolvimento

Com Node.js e npm instalados, entre na pasta da extensão e gere um novo VSIX:

~~~sh
cd codex-quota
npm exec --yes --package=@vscode/vsce --call "vsce package --no-dependencies -o dist/codex-quota-panel-0.3.2.vsix"
~~~

Antes de publicar uma nova versão, atualize o campo version em codex-quota/package.json e ajuste o nome do arquivo VSIX nos comandos acima.

## 🔄 Sobre atualizações

Cada extensão tem sua própria versão e é empacotada separadamente. **Instalar um VSIX deste repositório não configura atualização automática**: para receber mudanças, instale o VSIX mais novo. Atualizações automáticas pelo VS Code dependem da publicação da extensão no Visual Studio Marketplace e de o auto-update estar ativado.

## 📁 Estrutura

~~~text
.
├── codex-quota/
│   ├── extension.js
│   ├── panel.js
│   ├── package.json
│   ├── README.md
│   └── resources/
└── README.md
~~~

---

Feito com ☕ e código.
