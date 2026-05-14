FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN ./node_modules/.bin/tsc -p tsconfig.build.json

EXPOSE 3000

CMD ["node", "dist/main.js"]
