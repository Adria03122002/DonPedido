import { Bonjour } from 'bonjour-service';

const bonjour = new Bonjour();

export function iniciarAnuncioMDNS(): void {
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

        advertisement.on('error', (err: Error) => {
            console.error('❌ [mDNS] Error:', err.message);
        });

    } catch (error: any) {
        console.error('⚠️ [mDNS] No iniciado:', error.message);
    }
}