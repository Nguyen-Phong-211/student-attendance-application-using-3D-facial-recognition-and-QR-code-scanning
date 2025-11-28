# Base image
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    curl git build-essential python3-dev libpq-dev libffi-dev libssl-dev \
    libcairo2 libcairo2-dev libpango-1.0-0 libpango1.0-dev \
    libgdk-pixbuf-2.0-0 libgdk-pixbuf-2.0-dev libgobject-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

WORKDIR /app

COPY requirements-linux.txt /app/
RUN pip install --upgrade pip
RUN pip install wheel
RUN pip install -r requirements-linux.txt

COPY . /app/

WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

EXPOSE 8000 3000

WORKDIR /app
CMD ["./start.sh"]