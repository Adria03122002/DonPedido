import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { AuthService } from '../../../../services/auth.service';
import { Usuario } from '../../../../interfaces/usuario';

@Component({
  selector: 'app-usuario-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-gestion.component.html',
  styleUrls: ['./usuario-gestion.component.css']
})
export class UsuarioGestionComponent implements OnInit {
  
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  // Estados de la interfaz de usuario
  mostrarModalAlta = signal(false);
  usuarioAEliminar = signal<number | null>(null);
  cargando = signal(false);
  
  // ID del usuario que tiene la sesión iniciada actualmente
  idUsuarioActual = signal<number | null>(null);

  // Datos para la creación de un nuevo usuario
  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'Camarero'
  };

  // Lista de usuarios obtenida de la base de datos
  usuarios = signal<Usuario[]>([]);

  ngOnInit() {
    this.obtenerUsuarios();
    
    // Obtenemos la información del usuario logueado para proteger su registro
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.idUsuarioActual.set(user.id);
    }
  }

  // Carga la lista completa de usuarios desde el backend
  obtenerUsuarios() {
    this.cargando.set(true);
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la lista de usuarios:', err);
        this.cargando.set(false);
      }
    });
  }

  // Envía los datos del formulario al servicio para crear un nuevo registro
  guardarUsuario() {
    if (this.nuevoUsuario.nombre && this.nuevoUsuario.email && this.nuevoUsuario.password) {
      this.usuarioService.create(this.nuevoUsuario).subscribe({
        next: (usuarioCreado) => {
          // Actualizamos la lista local añadiendo el nuevo usuario
          this.usuarios.update(prev => [...prev, usuarioCreado]);
          this.cerrarModalAlta();
        },
        error: (err) => console.error('Error al guardar el nuevo usuario:', err)
      });
    }
  }

  // Procesa la eliminación definitiva tras la confirmación en el modal
  confirmarEliminacion() {
    const id = this.usuarioAEliminar();
    
    // Validación de seguridad: no permitir que un usuario se elimine a sí mismo
    if (id === this.idUsuarioActual()) {
      console.error('Operación no permitida: no puedes eliminar tu propia cuenta.');
      this.usuarioAEliminar.set(null);
      return;
    }

    if (id) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          // Filtramos la lista local para reflejar el borrado sin recargar la página
          this.usuarios.update(prev => prev.filter(u => u.id !== id));
          this.usuarioAEliminar.set(null);
        },
        error: (err) => console.error('Error al intentar eliminar el usuario:', err)
      });
    }
  }

  // Controladores de visibilidad para el modal de alta
  abrirModalAlta() {
    this.mostrarModalAlta.set(true);
  }

  cerrarModalAlta() {
    this.mostrarModalAlta.set(false);
    // Reiniciamos el objeto para limpiar el formulario
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Camarero' };
  }

  // Activa el modal de confirmación si el ID es válido y no es el propio usuario
  pedirConfirmacion(id: number | undefined) {
    if (id !== undefined && id !== this.idUsuarioActual()) {
      this.usuarioAEliminar.set(id);
    }
  }

  // Cancela el proceso de borrado y cierra el modal
  cancelarEliminacion() {
    this.usuarioAEliminar.set(null);
  }
}