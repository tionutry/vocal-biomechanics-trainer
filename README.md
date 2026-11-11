# Vocal Biomechanics Trainer

PWA para treino vocal biomecânico: protocolo em 3 fases (Isolamento, Acoplamento, Resistência), timer de prática/descanso e diário de sensações. Funciona 100% offline depois do primeiro carregamento e pode ser instalado no celular ou no computador.

> Aviso: app educativo. Não substitui avaliação de fonoaudiólogo ou otorrinolaringologista.

## Requisitos
Node.js 18 ou superior (recomendado 20).

## Rodar localmente
```bash
npm install
npm run dev
```
Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Build de produção
```bash
npm run build
npm run preview
```
O service worker só funciona no build (`preview`), não no `dev`.

Teste offline: abra o preview, recarregue uma vez, ative "Offline" em DevTools > Application > Service Workers e recarregue.

## Deploy no GitHub Pages (automático)
1. Crie um repositório no GitHub e envie todos os arquivos (inclusive a pasta oculta `.github`).
2. Em Settings > Pages, em "Source", escolha **GitHub Actions**.
3. Faça push na branch `main`. O workflow gera o build com o caminho correto (`/NOME-DO-REPOSITORIO/`) e publica.
4. O app ficará em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Deploy na Vercel
Importe o repositório. Framework: Vite, comando `npm run build`, saída `dist`. Não defina `VITE_BASE_PATH`.

## Ícones
`public/` já traz `icon-192x192.png` e `icon-512x512.png`. Para trocar, edite `public/icon.svg` e rode `npm run icons`.

## Estrutura
- `src/store/useVocalStore.ts`: estado global (fase atual, logs, configurações) com persistência segura em localStorage
- `src/hooks/useLocalStorage.ts`: hook de localStorage sincronizado entre abas e adaptador seguro para o Zustand
- `src/components/`: Layout, PhaseCard, SessionTimer, DailyLogForm
- `src/utils/constants.ts`: textos das fases, tags de sensação e alertas de segurança
