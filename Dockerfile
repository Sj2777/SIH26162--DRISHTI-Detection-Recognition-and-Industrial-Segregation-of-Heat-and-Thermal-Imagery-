FROM node:22-bookworm AS root-frontend-build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build


FROM node:22-bookworm AS industrial-frontend-build

WORKDIR /app/industrial-portal/frontend
COPY industrial-portal/frontend/package.json industrial-portal/frontend/package-lock.json ./
RUN npm ci
COPY industrial-portal/frontend/ ./
RUN npm run build


FROM node:22-bookworm AS industrial-backend-build

WORKDIR /app/industrial-portal/backend
COPY industrial-portal/backend/package.json industrial-portal/backend/package-lock.json ./
RUN npm ci
COPY industrial-portal/backend/tsconfig.json ./
COPY industrial-portal/backend/src ./src
COPY industrial-portal/backend/data ./data
RUN npm run build


FROM node:22-bookworm AS industrial-backend-dependencies

WORKDIR /app/industrial-portal/backend
COPY industrial-portal/backend/package.json industrial-portal/backend/package-lock.json ./
RUN npm ci --omit=dev


FROM node:22-bookworm AS runtime

ENV NODE_ENV=production \
    PORT=10000 \
    PATH=/opt/venv/bin:$PATH

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        build-essential \
        ca-certificates \
        curl \
        gettext-base \
        git \
        nginx \
        python3 \
        python3-pip \
        python3-venv \
    && python3 -m venv /opt/venv \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/public/data /etc/nginx/templates

WORKDIR /app

COPY backend/requirements-context.txt backend/requirements-eumdac.txt backend/requirements-prithvi-full.txt ./backend/
RUN python -m pip install --no-cache-dir -r backend/requirements-context.txt \
    && python -m pip install --no-cache-dir -r backend/requirements-eumdac.txt \
    && python -m pip install --no-cache-dir -r backend/requirements-prithvi-full.txt

COPY --from=root-frontend-build /app/dist ./dist
COPY --from=root-frontend-build /app/public/data ./public/data
COPY --from=industrial-frontend-build /app/industrial-portal/frontend/dist ./industrial-portal/frontend/dist
COPY --from=industrial-backend-build /app/industrial-portal/backend/dist ./industrial-portal/backend/dist
COPY --from=industrial-backend-build /app/industrial-portal/backend/data ./industrial-portal/backend/data
COPY --from=industrial-backend-dependencies /app/industrial-portal/backend/node_modules ./industrial-portal/backend/node_modules

COPY backend/context_service.py backend/prithvi_service.py backend/sentinel3_eumdac.py backend/seviri_eumdac.py ./backend/
COPY backend/requirements-prithvi-lite.txt ./backend/

COPY docker/nginx.conf /etc/nginx/templates/nginx.conf.template
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod 0755 /usr/local/bin/start.sh \
    && rm -f /etc/nginx/sites-enabled/default

EXPOSE 10000

CMD ["/usr/local/bin/start.sh"]
