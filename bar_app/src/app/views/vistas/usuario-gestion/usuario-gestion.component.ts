import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/interfaces/usuario';

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

  mostrarModalAlta = signal(false);
  usuarioAEliminar = signal<number | null>(null);
  usuarioEditando = signal<Usuario | null>(null);
  cargando = signal(false);
  
  idUsuarioActual = signal<number | null>(null);

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'Camarero' 
  };

  usuarios = signal<Usuario[]>([]);

  ngOnInit() {
    this.obtenerUsuarios();
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.idUsuarioActual.set(user.id);
    }
  }

  obtenerUsuarios() {
    this.cargando.set(true);
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener la lista de usuarios:', err);
        this.cargando.set(false);
      }
    });
  }

  abrirEditar(user: Usuario) {
    this.usuarioEditando.set(user);
    
    const nombreRol = typeof user.rol === 'object' ? user.rol.nombre : user.rol;
    
    this.nuevoUsuario = {
      nombre: user.nombre,
      email: user.email,
      password: '', 
      rol: nombreRol || 'Camarero'
    };
    this.mostrarModalAlta.set(true);
  }


  private obtenerPayloadRol(nombreRol: string) {
    const r = nombreRol.trim().toLowerCase();
    
    if (r === 'administrador') return { id: 1 };
    if (r === 'cocinero') return { id: 2 };
    
    return { id: 3 };
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email) return;

    const editandoId = this.usuarioEditando()?.id;

    const payload: any = {
      nombre: this.nuevoUsuario.nombre.trim(),
      email: this.nuevoUsuario.email.trim(),
      rol: this.obtenerPayloadRol(this.nuevoUsuario.rol)
    };

    if (this.nuevoUsuario.password && this.nuevoUsuario.password.trim() !== '') {
      payload.password = this.nuevoUsuario.password;
    }

    if (editandoId) {
      this.usuarioService.update(editandoId, payload).subscribe({
        next: () => {
          this.obtenerUsuarios();
          this.cerrarModalAlta();
          console.log('Usuario actualizado correctamente');
        },
        error: (err) => {
          console.error('Error en la actualización:', err);
        }
      });
    } else {
      this.usuarioService.create(payload).subscribe({
        next: (usuarioCreado) => {
          this.usuarios.update(prev => [...prev, usuarioCreado]);
          this.cerrarModalAlta();
        },
        error: (err) => console.error('Error en la creación:', err)
      });
    }
  }


  confirmarEliminacion() {
    const id = this.usuarioAEliminar();
    if (id && id !== this.idUsuarioActual()) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.usuarios.update(prev => prev.filter(u => u.id !== id));
          this.usuarioAEliminar.set(null);
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  abrirModalAlta() {
    this.usuarioEditando.set(null);
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Camarero' };
    this.mostrarModalAlta.set(true);
  }

  cerrarModalAlta() {
    this.mostrarModalAlta.set(false);
    this.usuarioEditando.set(null);
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Camarero' };
  }

  pedirConfirmacion(id: number | undefined) {
    if (id !== undefined && id !== this.idUsuarioActual()) {
      this.usuarioAEliminar.set(id);
    }
  }

  cancelarEliminacion() {
    this.usuarioAEliminar.set(null);
  }

  getNombreRol(rol: any): string {
    if (!rol) return 'Sin Rol';
    return typeof rol === 'object' ? rol.nombre : rol;
  }
}