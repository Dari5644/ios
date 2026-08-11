FROM node:20-alpine

WORKDIR /app

# مكتبة better-sqlite3 تحتاج أدوات بناء أصلية (native build) على Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# مجلد قاعدة البيانات المشتركة (اربطه بـ volume خارجي حتى لا تُفقد البيانات عند إعادة بناء الحاوية)
VOLUME ["/app/../database"]

EXPOSE 5000
CMD ["node", "src/server.js"]
