FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build && ls dist/main.js

EXPOSE 3000

CMD ["node", "dist/main.js"]
