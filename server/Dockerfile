FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  python3-pip \
  python3-venv \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY ml/requirements.txt ./ml/requirements.txt
RUN pip3 install --no-cache-dir -r ./ml/requirements.txt

COPY . .

ENV NODE_ENV=production
ENV PYTHON_EXECUTABLE=python3

CMD ["npm", "start"]
