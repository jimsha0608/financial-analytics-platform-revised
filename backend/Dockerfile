FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencies first so `docker compose build` can reuse this layer on
# every rebuild that only touches application code, not requirements.
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8000

# entrypoint runs migrations + collectstatic against whatever DATABASE_URL
# / SECRET_KEY docker-compose injects at container start, then hands off to
# gunicorn - keeps secrets out of the image itself (never baked in at build).
ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
