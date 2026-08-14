import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Contact } from '../../../core/models/contact.model';
import { ContactStore } from '../../../core/services/contact-store.service';
import { ToastService } from '../../../core/services/toast.service';
import { ContactCardComponent } from '../../../shared/components/contact-card/contact-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

/**
 * Página contenedora: lista de contactos con búsqueda, estados de
 * carga/error/vacío y acceso a alta, detalle y favoritos.
 *
 * Toda la lógica de datos vive en `ContactStore`; esta página solo orquesta
 * (patrón contenedor vs. presentacional de `docs/02-arquitectura-y-buenas-practicas.md`).
 */
@Component({
  selector: 'app-contact-list-page',
  imports: [RouterLink, ContactCardComponent, EmptyStateComponent, SearchFieldComponent, SpinnerComponent],
  templateUrl: './contact-list.page.html',
  styleUrl: './contact-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactListPage implements OnInit {
  protected readonly store = inject(ContactStore);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    void this.store.load();
  }

  protected onSearch(term: string): void {
    this.store.setQuery(term);
  }

  protected async onToggleFavorite(contact: Contact): Promise<void> {
    try {
      await this.store.toggleFavorite(contact);
    } catch {
      this.toast.error('No se pudo actualizar el favorito.');
    }
  }

  protected onRetry(): void {
    void this.store.load();
  }

  protected onResetSeed(): void {
    this.store.resetToSeed();
    this.toast.info('Se restablecieron los datos de ejemplo.');
  }
}
