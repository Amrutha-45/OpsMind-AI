FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY opsmind ./opsmind

ENV OPSMIND_HOST=0.0.0.0 \
    OPSMIND_PORT=8000 \
    OPSMIND_DB_PATH=/data/opsmind.db

VOLUME ["/data"]
EXPOSE 8000

CMD ["uvicorn", "opsmind.api:app", "--host", "0.0.0.0", "--port", "8000"]
