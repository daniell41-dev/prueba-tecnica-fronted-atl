import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';
import { Contact, fullName } from '../../../core/models/contact.model';
import { AvatarComponent } from '../avatar/avatar.component';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';

/**
 * Fila de contacto para la lista: avatar, nombre, teléfono principal y
 * estrella de favorito. Presentacional puro — recibe el `Contact` ya resuelto
 * y solo emite intención (`favoriteToggled`); quien orquesta la mutación real
 * es la página contenedora vía `ContactStore`.
 */
@Component({
  selector: 'app-contact-card',
  imports: [AvatarComponent, PhoneFormatPipe],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCardComponent {
  readonly contact = input.required<Contact>();
  readonly favoriteToggled = output<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly fullName = fullName;

  protected primaryPhone(contact: Contact): string | null {
    return contact.phones[0]?.number ?? null;
  }

  protected onToggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggled.emit();
  }
}
