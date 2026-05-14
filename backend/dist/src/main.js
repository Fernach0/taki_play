"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', '..', 'public'));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({ origin: '*' });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`\n🎵 Taki Play Backend corriendo en: http://localhost:${port}/api/v1`);
    console.log(`📁 Archivos estáticos en:          http://localhost:${port}/media/`);
}
bootstrap();
//# sourceMappingURL=main.js.map