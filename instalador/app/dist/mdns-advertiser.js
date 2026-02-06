"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarAnuncioMDNS = iniciarAnuncioMDNS;
const bonjour_service_1 = require("bonjour-service");
const bonjour = new bonjour_service_1.Bonjour();
function iniciarAnuncioMDNS() {
    try {
        const advertisement = bonjour.publish({
            name: 'Don Pedido Server',
            type: 'http',
            port: 3000,
            host: 'donpedido.local'
        });
        advertisement.on('up', () => {
            console.log('🚀 [mDNS] Servicio activo: http://donpedido.local:3000');
        });
        advertisement.on('error', (err) => {
            console.error('❌ [mDNS] Error:', err.message);
        });
    }
    catch (error) {
        console.error('⚠️ [mDNS] No iniciado:', error.message);
    }
}
//# sourceMappingURL=mdns-advertiser.js.map