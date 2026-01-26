import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  salir() {
    this.router.navigate(['/']); // Redirige a la ventana principal
  }

  getRol(): string {
    return this.authService.getUserRole() ?? '';
  }


}
