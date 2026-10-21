FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./package.json
COPY shared/ ./shared/
COPY admin/ ./admin/
COPY assistant/chatgpt-auth.mjs assistant/engine.mjs ./assistant/
COPY assistant/host/ ./assistant/host/
ENV NODE_ENV=production CRM_AGENT_DATA_DIRECTORY=/data CRM_AGENT_BIND=0.0.0.0 PORT=3040
USER node
EXPOSE 3040
CMD ["node", "assistant/host/start.mjs"]
