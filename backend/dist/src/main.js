"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const dns = require("dns");
const app_module_1 = require("./app.module");
dns.setDefaultResultOrder('ipv4first');
async function bootstrap() {
    console.log('Iniciando el servidor NestJS...');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors({ origin: '*' });
        const port = process.env.PORT || 3000;
        await app.listen(port, '0.0.0.0');
        console.log(`Servidor corriendo en puerto ${port} (0.0.0.0)`);
        console.log(`API disponible en: http://0.0.0.0:${port}/api/v1`);
    }
    catch (error) {
        console.error('Error fatal al arrancar la aplicación:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map