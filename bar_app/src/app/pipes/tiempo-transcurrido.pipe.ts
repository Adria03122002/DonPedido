import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido'
})
export class TiempoTranscurridoPipe implements PipeTransform {

  transform(value: string | Date): string {
    const ahora = new Date();
    const fecha = new Date(value);
    const diffMs = ahora.getTime() - fecha.getTime();

    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''} atrás`;
    if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''} atrás`;
    if (minutos > 0) return `${minutos} minuto${minutos > 1 ? 's' : ''} atrás`;
    return 'justo ahora';
  }
}
