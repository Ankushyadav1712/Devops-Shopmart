# syntax=docker/dockerfile:1.6

# ---- Stage 1: build / install production deps ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5001

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/index.js ./index.js
COPY --from=build --chown=app:app /app/config ./config
COPY --from=build --chown=app:app /app/routes ./routes
COPY --from=build --chown=app:app /app/models ./models
COPY --from=build --chown=app:app /app/data ./data

USER app

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||5001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "index.js"]
