import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../core/i18n/i18n.service';
import { Contact, ContactDraft, PhoneLabel } from '../../../core/models/contact.model';
import { ContactStore } from '../../../core/services/contact-store.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  minArrayLength,
  mxPhoneValidator,
  nameValidator,
  uniqueEmailValidator,
  uniquePhonesValidator,
} from '../../../core/validators/contact.validators';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { PhoneFieldsetComponent } from './components/phone-fieldset/phone-fieldset.component';
import { ContactFormGroup, PhoneGroup } from './contact-form.types';

const NAME_MAX_LENGTH = 40;
const COMPANY_MAX_LENGTH = 60;

/**
 * Alta y edición de contactos en una sola página: sin `id` en la ruta es
 * "nuevo", con `id` es "editar" (mismo formulario, misma validación, sin
 * duplicar código entre los dos flujos — DRY).
 *
 * Nada se persiste hasta pulsar "Guardar". "Cancelar" descarta los cambios
 * (con confirmación si el formulario está sucio) y `unsavedChangesGuard`
 * cubre además la navegación por fuera del botón (back del navegador, tabs).
 */
@Component({
  selector: 'app-contact-form-page',
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent, FieldErrorComponent, PhoneFieldsetComponent],
  templateUrl: './contact-form.page.html',
  styleUrl: './contact-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormPage implements OnInit, HasUnsavedChanges {
  /** Ausente en `/contacts/new`; presente en `/contacts/:id/edit` (component input binding). */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(ContactStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  readonly saving = signal(false);
  readonly confirmingDiscard = signal(false);
  readonly notFound = signal(false);
  private submitted = false;

  readonly form: ContactFormGroup = this.fb.group({
    firstName: this.fb.control('', [Validators.required, Validators.maxLength(NAME_MAX_LENGTH), nameValidator()]),
    lastName: this.fb.control('', [Validators.required, Validators.maxLength(NAME_MAX_LENGTH), nameValidator()]),
    email: this.fb.control('', [Validators.email, uniqueEmailValidator(() => this.existingEmails())]),
    company: this.fb.control('', [Validators.maxLength(COMPANY_MAX_LENGTH)]),
    phones: this.fb.array<PhoneGroup>([], [minArrayLength(1), uniquePhonesValidator()]),
  });

  get isEditMode(): boolean {
    return this.id() !== undefined;
  }

  async ngOnInit(): Promise<void> {
    const id = this.id();

    if (!id) {
      this.addPhoneRow();
      // No bloquea el alta: solo se necesita para la validación de email único.
      if (this.store.status() === 'idle') void this.store.load();
      return;
    }

    // Cubre la recarga directa a "/contacts/:id/edit" (la lista aún no cargó).
    if (this.store.status() !== 'loaded') {
      await this.store.load();
    }

    const existing = this.store.findById(id);
    if (existing) this.patchForm(existing);
    else this.notFound.set(true);
  }

  hasUnsavedChanges(): boolean {
    return !this.submitted && this.form.dirty;
  }

  get phones(): FormArray<PhoneGroup> {
    return this.form.controls.phones;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const draft = this.toDraft();
    try {
      const id = this.id();
      const saved = id ? await this.store.update(id, draft) : await this.store.create(draft);
      this.submitted = true;
      this.toast.success(this.i18n.t(id ? 'form.toastUpdated' : 'form.toastCreated'));
      await this.router.navigate(['/contacts', saved.id]);
    } catch {
      this.toast.error(this.i18n.t('form.toastError'));
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    if (this.form.dirty) {
      this.confirmingDiscard.set(true);
      return;
    }
    this.leave();
  }

  confirmDiscard(): void {
    this.confirmingDiscard.set(false);
    this.leave();
  }

  cancelDiscard(): void {
    this.confirmingDiscard.set(false);
  }

  // ── Internos ──────────────────────────────────────────────────────────────

  private leave(): void {
    this.submitted = true; // ya se decidió descartar; el guard no debe volver a preguntar.
    const id = this.id();
    this.router.navigateByUrl(id ? `/contacts/${id}` : '/contacts');
  }

  private existingEmails(): string[] {
    return this.store.emailsExcept(this.id());
  }

  private addPhoneRow(): void {
    this.phones.push(
      this.fb.group({
        id: this.fb.control<string | undefined>(undefined),
        label: this.fb.control<PhoneLabel>('mobile', { validators: Validators.required }),
        number: this.fb.control('', { validators: [Validators.required, mxPhoneValidator()] }),
      }),
    );
  }

  private patchForm(contact: Contact): void {
    this.form.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? '',
      company: contact.company ?? '',
    });
    this.phones.clear();
    for (const phone of contact.phones) {
      this.phones.push(
        this.fb.group({
          id: this.fb.control<string | undefined>(phone.id),
          label: this.fb.control(phone.label, { validators: Validators.required }),
          number: this.fb.control(phone.number, { validators: [Validators.required, mxPhoneValidator()] }),
        }),
      );
    }
    this.form.markAsPristine();
  }

  private toDraft(): ContactDraft {
    const value = this.form.getRawValue();
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email || null,
      company: value.company || null,
      phones: value.phones.map((phone) => ({ id: phone.id, label: phone.label, number: phone.number })),
    };
  }
}
