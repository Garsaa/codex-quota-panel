# 🧩 Extensões dos Cria

**Extensões pequenas, úteis e feitas pra deixar o VS Code dos cria.**

Este repositório reúne projetos independentes: **uma extensão por pasta**, cada uma com seu próprio código, manifesto, documentação e versão.

## ✨ Catálogo

| Extensão | Pasta | O que faz |
| --- | --- | --- |
| **Codex Quota** | [codex-quota/](codex-quota/) | Mostra o uso restante e os horários de reset do Codex dentro do VS Code. |
| **Antigravity Quota** | [antigravity-quota/](antigravity-quota/) | Mostra o uso restante e os horários de reset do Antigravity no VS Code com progresso roxo e suporte a abas de modelos. |

## 🚀 Instalação

### Codex Quota

1. Instale a extensão oficial **Codex** (`openai.chatgpt`) e entre na sua conta.
2. Baixe [codex-quota-panel-0.3.3.vsix](codex-quota/dist/codex-quota-panel-0.3.3.vsix).
3. No terminal, na raiz deste repositório, execute:

   ~~~sh
   code --install-extension codex-quota/dist/codex-quota-panel-0.3.3.vsix --force
   ~~~

   Ou no VS Code: **Extensions** → **…** → **Install from VSIX…**.
4. Recarregue a janela e abra o painel **Limites** junto ao Codex.

### Antigravity Quota

1. Certifique-se de ter o CLI **Antigravity** (`agy`) instalado e autenticado com sua conta Google (`agy login`).
2. *(Recomendado)* Tenha a extensão **Antigravity for VS Code** (`lyadhgod.antigravity-vscode`) instalada para que o painel apareça na barra lateral do Antigravity.
3. Baixe [antigravity-quota-panel-0.1.0.vsix](antigravity-quota/dist/antigravity-quota-panel-0.1.0.vsix).
4. No terminal, na raiz deste repositório, execute:

   ~~~sh
   code --install-extension antigravity-quota/dist/antigravity-quota-panel-0.1.0.vsix --force
   ~~~

   Ou no VS Code: **Extensions** → **…** → **Install from VSIX…**.
5. Recarregue a janela e visualize o painel **Limites** com barras de progresso roxas.

## 💡 O que elas mostram

- Limite restante nas janelas de **5 horas** e **1 semana**.
- Percentuais, barras de progresso estilizadas e horários de reset.
- Resumo dos limites em tempo real na barra de status.
- Resets guardados / Créditos de IA com links rápidos.
- Atualização automática periódica e botão de atualização imediata.

## 🛠️ Empacotar para desenvolvimento

Com Node.js e npm instalados, entre na pasta de qualquer extensão e gere um novo VSIX:

~~~sh
# Codex Quota
cd codex-quota
npm exec --yes --package=@vscode/vsce --call "vsce package --no-dependencies -o dist/codex-quota-panel-0.3.3.vsix"

# Antigravity Quota
cd ../antigravity-quota
npm exec --yes --package=@vscode/vsce --call "vsce package --no-dependencies -o dist/antigravity-quota-panel-0.1.0.vsix"
~~~

## 🔄 Sobre atualizações

Cada extensão tem sua própria versão e é empacotada separadamente. **Instalar um VSIX deste repositório não configura atualização automática**: para receber mudanças, instale o VSIX mais novo.

## 📁 Estrutura

~~~text
.
├── antigravity-quota/
│   ├── dist/
│   ├── extension.js
│   ├── panel.js
│   ├── package.json
│   ├── README.md
│   └── resources/
├── codex-quota/
│   ├── dist/
│   ├── extension.js
│   ├── panel.js
│   ├── package.json
│   ├── README.md
│   └── resources/
└── README.md
~~~

---

Feito com ☕ e código.
