FROM node:20-alpine

WORKDIR /app

# أدوات البناء الخاصة بـ better-sqlite3 على Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# إنشاء مجلد قاعدة البيانات داخل /app وتحديده كـ Volume
RUN mkdir -p /app/database
VOLUME ["/app/database"]

EXPOSE 5000
CMD ["node", "src/server.js"]
