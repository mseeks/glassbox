# The static-site image: Vite builds the bundle, nginx serves it. Built and
# pushed to ghcr.io by CI (.github/workflows/ci.yml), deployed to the DOKS
# cluster (infra/k8s/glassbox in the zo workspace). Nothing secret is baked in —
# Glassbox is a fully static, client-only site.

# ── build stage ────────────────────────────────────────────────────────────
# Node 22 to match .nvmrc. Browsers are never needed here (the Playwright smoke
# runs in CI, not in this image), so skip the download.
FROM node:22-slim AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Lockfile-first for a cached dependency layer; `npm ci` is reproducible.
COPY package.json package-lock.json ./
RUN npm ci

# Then the source, then the production build → /app/dist.
COPY . .
RUN npm run build

# ── runtime stage ──────────────────────────────────────────────────────────
# A bare nginx serving the hashed static assets. No Node in the final image.
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
