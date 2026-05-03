FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npx tsc -p tsconfig.build.json

RUN test -f dist/main.js && echo "dist/main.js OK" || (echo "ERROR: dist/main.js not found" && exit 1)

EXPOSE 3000

CMD ["node", "dist/main"]
