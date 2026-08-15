import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../core/i18n/i18n.service';
import { fullName, PHONE_LABEL_TRANSLATION_KEYS } from '../../../core/models/contact.model';
import { ContactStore } from '../../../core/services/contact-store.service';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

/**
 * Ficha de un contacto: datos completos, acciones de editar/eliminar/favorito.
 *
 * El `id` llega como `@Input()` gracias a `withComponentInputBinding()` en
 * `app.config.ts`, sin necesidad de inyectar `ActivatedRoute` a mano.
 */
@Component({
  selector: 'app-contact-detail-page',
  imports: [RouterLink, AvatarComponent, ConfirmDialogComponent, EmptyStateComponent, PhoneFormatPipe],
  templateUrl: './contact-detail.page.html',
  styleUrl: './contact-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailPage implements OnInit {
  readonly id = input.required<string>();

  protected readonly store = inject(ContactStore);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly fullName = fullName;
  protected readonly phoneLabelTranslationKeys = PHONE_LABEL_TRANSLATION_KEYS;
  protected readonly confirmingDelete = signal(false);

  ngOnInit(): void {
    // Entrando por URL directa (recarga) la lista aún no está cargada.
    if (this.store.status() === 'idle') {
      void this.store.load();
    }
  }

  protected contact() {
    return this.store.findById(this.id());
  }

  protected async onToggleFavorite(): Promise<void> {
    const contact = this.contact();
    if (!contact) return;
    try {
      await this.store.toggleFavorite(contact);
    } catch {
      this.toast.error(this.i18n.t('common.favoriteUpdateError'));
    }
  }

  protected askDelete(): void {
    this.confirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  protected goToList(): void {
    this.router.navigateByUrl('/contacts');
  }

  protected async confirmDelete(): Promise<void> {
    const contact = this.contact();
    this.confirmingDelete.set(false);
    if (!contact) return;
    try {
      await this.store.remove(contact.id);
      this.toast.success(this.i18n.t('detail.deleteToastSuccess'));
      this.router.navigateByUrl('/contacts');
    } catch {
      this.toast.error(this.i18n.t('detail.deleteToastError'));
    }
  }
}
