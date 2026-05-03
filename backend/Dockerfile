FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN echo "=== src files ===" && ls src/ && echo "=== tsconfig ===" && test -f tsconfig.build.json && echo "tsconfig.build.json OK"

RUN ./node_modules/.bin/tsc -p tsconfig.build.json

RUN echo "=== after build ===" && ls -la && ls dist/ 2>/dev/null || echo "NO DIST"

RUN test -f dist/main.js && echo "dist/main.js OK" || (echo "ERROR: dist/main.js not found" && exit 1)

EXPOSE 3000

CMD ["node", "dist/main"]
