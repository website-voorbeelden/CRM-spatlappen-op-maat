FROM python:3.12-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer poppler-utils fontconfig fonts-liberation2 fonts-croscore \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN pip install --no-cache-dir 'lxml>=5.3,<7'
COPY document-generator.py ./
COPY document-service/server.py document-service/runtime.json ./document-service/
COPY document-service/templates/ ./document-service/templates/
RUN useradd --create-home --uid 10001 crm && chown -R crm:crm /app
USER crm
ENV CRM_DOCUMENT_RUNTIME=/app/document-service/runtime.json PORT=10000
EXPOSE 10000
CMD ["python", "document-service/server.py"]
