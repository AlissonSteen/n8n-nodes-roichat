@"
# n8n-nodes-roichat

Community Nodes para integrar a API do **RoiChat** ao n8n.

## Instalação
No n8n: **Settings → Community Nodes → Install** e procure por **n8n-nodes-roichat**.

## Credenciais
Crie as credenciais **RoiChat API** com sua *API Key*.

## Uso
- Node: **RoiChat** → *Flow → Get Bot Fields*
- Trigger: **RoiChat Trigger** (recebe webhooks do RoiChat)

## Licença
MIT
"@ | Out-File -Encoding utf8 README.md
git add README.md
git commit -m "docs: add README"
