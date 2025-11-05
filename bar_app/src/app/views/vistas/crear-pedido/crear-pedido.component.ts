import { Component, OnInit } from '@angular/core';
import { CrearPedidoPayload } from 'src/app/interfaces/pedido';
import { Producto } from 'src/app/interfaces/producto';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Router } from '@angular/router';

// La interfaz LineaPedido es lo que estás manejando en el frontend
interface LineaActual {
    producto: Producto;
    cantidad: number;
    modificacion: string;
}

@Component({
    selector: 'app-crear-pedido',
    templateUrl: './crear-pedido.component.html',
    styleUrls: ['./crear-pedido.component.css']
})
export class CrearPedidoComponent implements OnInit {
    
    // --- PROPIEDADES ---
    productosMenu: Producto[] = [];
    lineasPedido: LineaActual[] = []; // Líneas que se añadirán al pedido
    ubicacion: string = '';
    mesasDisponibles: number[] = Array.from({length: 12}, (_, i) => i + 1);
    nombreCliente: any;

    // --- CONSTRUCTOR ---
    constructor(
        private productoService: ProductoService,
        private pedidoService: PedidoService,
        private router: Router
    ) { }

    // --- NG ON INIT ---
    ngOnInit(): void {
        this.productoService.getAll().subscribe(productos => {
            this.productosMenu = productos.filter(p => p.disponible);
        });
    }

    // --- MÉTODOS AUXILIARES DE VISTA ---
    agregarProducto(producto: Producto): void {
        const lineaExistente = this.lineasPedido.find(l => l.producto.id === producto.id);

        if (lineaExistente) {
            lineaExistente.cantidad++;
        } else {
            this.lineasPedido.push({
                producto: producto,
                cantidad: 1,
                modificacion: ''
            });
        }
    }

    eliminarLinea(index: number): void {
        this.lineasPedido.splice(index, 1);
    }

    calcularTotal(): number {
        return this.lineasPedido.reduce((total, linea) => total + (linea.cantidad * linea.producto.precio), 0);
    }
    

    enviarPedido(): void {
        // 1. Validaciones
        if (this.lineasPedido.length === 0 || !this.ubicacion) {
            alert('Debes añadir productos y seleccionar una ubicación.');
            return;
        }
        if (this.ubicacion === 'Recoger' && !this.nombreCliente.trim()) {
            alert('Debes ingresar el nombre del cliente para pedidos de recogida.');
            return;
        }

        // 2. Mapeo de Identificadores
        const esMesa = this.ubicacion.includes('Mesa');
        const tipoUbicacion = esMesa ? 'mesa' : 'recoger';
        const numeroMesa = esMesa ? parseInt(this.ubicacion.split(' ')[1]) : null;

        // PASO CLAVE: Verificar si ya existe un pedido activo 
        this.pedidoService.getPedidoActivoPorMesa(numeroMesa!).subscribe({
            next: (pedidoActivo) => {
                // Caso 1: PEDIDO ACTIVO ENCONTRADO (HACER UPDATE)
                this.ejecutarActualizacion(pedidoActivo, numeroMesa, tipoUbicacion);
            },
            error: (err) => {
                // Verificamos el código de estado HTTP para 404/No Content.
                if (err.status === 404) {
                    this.ejecutarCreacion(numeroMesa, tipoUbicacion);
                } else {
                    console.error('Error al verificar pedido activo:', err);
                    alert(`Error al verificar el estado de la mesa. Detalle: ${err.error?.details || 'Servidor no respondió'}`);
                }
            }
        });
    }

    // 1. Ejecuta la CREACIÓN (POST)
    ejecutarCreacion(numeroMesa: number | null, tipoUbicacion: string): void {
        // En este caso, solo enviamos las líneas recién añadidas (this.lineasPedido)
        const nuevoPayload = this.construirPayload(numeroMesa, tipoUbicacion, this.lineasPedido);
        
        this.pedidoService.crearPedido(nuevoPayload).subscribe({
            next: (response) => {
                alert(`Nuevo pedido ${response.id || 'creado'} y asignado.`);
                this.resetForm();
                this.router.navigate(['/barra/pedidos']);
            },
            error: (err: any) => { 
                console.error('Error al crear pedido:', err);
                alert(`Error al crear el pedido. Detalle: ${err.error?.details || 'Revisa el backend.'}`);
            }
        });
    }

    ejecutarActualizacion(pedidoActivo: any, numeroMesa: number | null, tipoUbicacion: string): void {
        
        const lineasActuales = pedidoActivo.lineas || []; 
        const lineasNuevas = this.lineasPedido; 
        
        const lineasTotales = this.consolidarLineas([...lineasActuales, ...lineasNuevas]);
        
        const payloadActualizado = this.construirPayload(numeroMesa, tipoUbicacion, lineasTotales);
        
    }

    // --- NUEVO MÉTODO PARA SUMAR PRODUCTOS IDÉNTICOS ---
    consolidarLineas(lineas: any[]): any[] {
        const mapaConsolidado = new Map();

        lineas.forEach(linea => {
            // Usamos el ID del producto y la modificación como clave única
            const key = `${linea.producto.id}-${linea.modificacion}`;

            if (mapaConsolidado.has(key)) {
                // Si ya existe, sumar la cantidad
                const lineaExistente = mapaConsolidado.get(key);
                lineaExistente.cantidad += linea.cantidad;
            } else {
                // Si no existe, añadir una copia de la línea
                mapaConsolidado.set(key, { ...linea });
            }
        });

        // Devolver el array de líneas consolidadas
        return Array.from(mapaConsolidado.values());
    }

    construirPayload(numeroMesa: number | null, tipoUbicacion: string, lineas: any[]): CrearPedidoPayload {
        const lineasValidas = lineas.filter(linea => 
            linea.producto && (linea.producto.id || linea.producto.id === 0)
        );
        
        return {
            ubicacion: { 
                numero: numeroMesa, 
                tipo: tipoUbicacion
            },
            nombreCliente: tipoUbicacion === 'recoger' ? this.nombreCliente.trim() : null, 
            estado: 'en preparación',
            fecha: new Date().toISOString(),
            pagado: false,
            
           lineas: lineasValidas.map(linea => {
                return {
                    cantidad: linea.cantidad,
                    producto: { id: linea.producto.id }, 
                    modificacion: linea.modificacion
                };
            })
        };
    }
    
    // --- RESET FORM ---
    resetForm(): void {
        this.lineasPedido = [];
        this.ubicacion = '';
        this.nombreCliente = '';
    }
}