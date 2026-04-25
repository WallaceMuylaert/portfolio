# README.md

## 📚 Visão Geral
Este é um **portfólio pessoal** construído com **React**, **Vite**, e **Framer Motion**. O projeto inclui:
- Design premium com modo escuro/claro, tipografia Google Font **Inter** e paleta de cores harmoniosa.
- Animações suaves usando **Framer Motion**.
- Layout completamente **responsivo** e **acessível** (focus outlines, contrastes, aria‑labels).
- Dockerfile para build e servir com **Nginx**.
- Configuração para publicação no **Netlify** via `netlify.toml`.
- Testes automatizados usando **Playwright** + **pytest**.

## 🚀 Como executar localmente
```bash
# Instalar dependências
npm ci

# Desenvolvimento (hot‑reload)
npm run dev

# Build de produção
npm run build
```

## 🐳 Executar com Docker
```bash
# Build da imagem Docker
docker build -t portfolio .

# Rodar o container
docker run -p 8080:80 portfolio
```
Acesse `http://localhost:8080`.

## 📦 Deploy no Netlify
1. Crie um novo site no Netlify e conecte ao repositório Git.
2. Netlify usa o comando `npm run build` (já definido no `netlify.toml`).
3. O diretório `dist` será publicado automaticamente.

## 🧪 Testes automatizados
### Pré‑requisitos
```bash
pip install -r requirements.txt  # instala pytest e playwright
playwright install                # instala browsers usados nos testes
```
### Executar os testes
```bash
pytest
```
Os testes verificam que a página carrega, verifica a presença dos elementos principais e roda uma checagem de acessibilidade com **axe‑core**.

## 🛠️ Estrutura de pastas
```
portfolio/
├─ src/                # Código fonte React
│   ├─ App.jsx
│   ├─ index.css
│   └─ main.jsx
├─ public/             # (vazio, Vite serve index.html na raiz)
├─ tests/              # Testes Playwright + pytest
│   └─ test_app.py
├─ Dockerfile
├─ netlify.toml
├─ package.json
└─ README.md
```

## 🎨 Design System
- Font: **Inter** (Google Fonts)
- Cores: HSL variáveis em `:root` para fácil theming.
- Radius, transições e sombras consistentes.
- Focus-visible com contorno de alto contraste.

## 📈 Próximos passos
- Adicionar mais projetos na seção "Projetos".
- Integrar GitHub Actions para CI/CD (build, lint, testes).
- Otimizar SEO (meta tags, Open Graph).