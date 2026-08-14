import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const AUTO_DISMISS_MS = 4000;

/**
 * Notificaciones efímeras ("toasts") para confirmar o avisar de errores tras
 * una acción (guardar, eliminar, restablecer datos).
 *
 * Se implementa como una cola de un único elemento visible expuesta por
 * signal: sencillo de renderizar desde `AppComponent` sin acoplar la UI a
 * ninguna librería.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private timeoutId?: ReturnType<typeof setTimeout>;

  readonly current = signal<Toast | null>(null);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(): void {
    clearTimeout(this.timeoutId);
    this.current.set(null);
  }

  private show(message: string, tone: ToastTone): void {
    clearTimeout(this.timeoutId);
    this.current.set({ id: ++this.nextId, message, tone });
    this.timeoutId = setTimeout(() => this.current.set(null), AUTO_DISMISS_MS);
  }
}
