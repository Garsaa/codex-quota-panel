# Antigravity Quota

Veja seus limites do Antigravity sem sair do VS Code.

O painel **Limites** fica na barra lateral do Antigravity (junto ao Chat) e mostra o uso restante nas janelas de **5 horas** e **1 semana**, barras de progresso na cor roxa, os horários de reset e o saldo de créditos de IA. Uma barra de status resume os percentuais.

## Recursos

- Barras de progresso com a cor roxa característica para os limites de 5 horas e semanal.
- Alternância rápida por abas entre grupos de modelos (**Gemini** e **Claude & GPT**).
- Horário e contagem regressiva para cada reset.
- Saldo de créditos de IA, com link direto para upgrade/detalhes.
- Atualização automática a cada minuto e atualização manual pelo botão **Atualizar**.
- Consulta feita direto pelo CLI oficial do Antigravity (`agy`).

## Requisitos

- Visual Studio Code **1.90.0** ou mais recente.
- CLI do Antigravity (`agy`) instalado e autenticado na sua conta Google.
- *(Opcional)* Extensão **Antigravity for VS Code** (`lyadhgod.antigravity-vscode`) para exibir o painel na mesma barra lateral do chat.

## Instalar pelo VSIX

Baixe o arquivo [antigravity-quota-panel-0.1.0.vsix](dist/antigravity-quota-panel-0.1.0.vsix) ou, na raiz do repositório, execute:

~~~sh
code --install-extension antigravity-quota/dist/antigravity-quota-panel-0.1.0.vsix --force
~~~

No VS Code, também é possível usar **Extensions** → **…** → **Install from VSIX…**. Depois, recarregue a janela e abra a barra lateral do Antigravity.

## Empacotar

Com Node.js e npm instalados, execute dentro desta pasta:

~~~sh
npm exec --yes --package=@vscode/vsce --call "vsce package --no-dependencies -o dist/antigravity-quota-panel-0.1.0.vsix"
~~~

Ao preparar uma nova versão, atualize `version` no `package.json` e o nome do arquivo VSIX para a mesma versão.

## Privacidade e compatibilidade

A extensão lê as cotas executando localmente o comando `agy -p "/usage" --output-format json` e `agy -p "/credits" --output-format json`. Ela não armazena credenciais nem envia dados a serviços de terceiros.
