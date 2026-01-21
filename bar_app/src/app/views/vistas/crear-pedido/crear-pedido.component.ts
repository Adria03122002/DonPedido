import { Component, OnInit } from '@angular/core';
import { CrearPedidoPayload } from 'src/app/interfaces/pedido';
import { Producto } from 'src/app/interfaces/producto';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Router } from '@angular/router';

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
    
    productosMenu: Producto[] = [];
    lineasPedido: LineaActual[] = []; 
    ubicacion: string = '';
    mesasDisponibles: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
    nombreCliente: string = '';

    constructor(
        private productoService: ProductoService,
        private pedidoService: PedidoService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.productoService.getAll().subscribe(productos => {
            this.productosMenu = productos.filter(p => p.disponible);
        });
    }

    /**
     * Añade un producto a la lista temporal de la comanda actual
     */
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
        return this.lineasPedido.reduce(
            (total, linea) => total + (linea.cantidad * linea.producto.precio),
            0
        );
    }
    
    /**
     * Proceso principal de envío
     */
    enviarPedido(): void {
        if (this.lineasPedido.length === 0 || !this.ubicacion) {
            alert('Debes añadir productos y seleccionar una ubicación (Mesa o Recoger).');
            return;
        }

        if (this.ubicacion === 'Recoger' && (!this.nombreCliente || !this.nombreCliente.trim())) {
            alert('Debes ingresar el nombre del cliente para pedidos de recogida.');
            return;
        }

        const esMesa = this.ubicacion.includes('Mesa');
        
        if (esMesa) {
            const numeroMesa = parseInt(this.ubicacion.split(' ')[1], 10);

            this.pedidoService.getPedidoActivoPorMesa(numeroMesa).subscribe({
                next: (pedidoActivo) => {
                    if (pedidoActivo) {
                        this.ejecutarActualizacion(pedidoActivo);
                    } else {
                        this.ejecutarCreacion();
                    }
                },
                error: (err) => {
                    if (err.status === 404) {
                        this.ejecutarCreacion();
                    } else {
                        alert('Error al conectar con el servidor.');
                    }
                }
            });
        } else {
            this.ejecutarCreacion();
        }
    }

    /**
     * Crea un pedido totalmente nuevo (Mesa vacía o Recogida)
     */
    ejecutarCreacion(): void {
        const nuevoPayload = this.construirPayload(this.lineasPedido);
        
        this.pedidoService.crearPedido(nuevoPayload).subscribe({
            next: (response) => {
                alert(`Pedido #${response.id} enviado a cocina.`);
                this.resetForm();
                this.router.navigate(['/barra/pedidos']);
            },
            error: (err) => { 
                alert(`Error al crear el pedido: ${err.error?.message || 'Error de red'}`);
            }
        });
    }

    /**
     * Añade líneas a un pedido que ya existe en esa mesa
     */
    ejecutarActualizacion(pedidoExistente: any): void {
        const lineasNuevasFormateadas = this.lineasPedido.map(l => ({
            producto: { id: l.producto.id },
            cantidad: l.cantidad,
            modificacion: l.modificacion
        }));

        this.pedidoService.updatePedido(pedidoExistente.id, {
            ...pedidoExistente,
            lineas: [...pedidoExistente.lineas, ...lineasNuevasFormateadas]
        }).subscribe({
            next: () => {
                alert('Comanda actualizada correctamente.');
                this.resetForm();
                this.router.navigate(['/barra/pedidos']);
            },
            error: () => alert('Error al actualizar el pedido existente.')
        });
    }

    /**
     * Transforma los datos del componente al formato JSON que espera el Backend
     */
    construirPayload(lineas: LineaActual[]): CrearPedidoPayload {
        return {
            ubicacion: this.ubicacion,
            nombreCliente: this.ubicacion === 'Recoger' ? this.nombreCliente.trim() : 'Mesa',
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            pagado: false,
            lineas: lineas.map(linea => ({
                cantidad: linea.cantidad,
                producto: { id: linea.producto.id },
                modificacion: linea.modificacion
            }))
        };
    }
    
    resetForm(): void {
        this.lineasPedido = [];
        this.ubicacion = '';
        this.nombreCliente = '';
    }
}
