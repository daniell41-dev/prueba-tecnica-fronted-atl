import { Routes } from '@angular/router';

import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

/**
 * Todas las páginas se cargan de forma perezosa (`loadComponent`) por feature,
 * como marca `docs/03-arquitectura-y-buenas-practicas.md` del proyecto Nimbo.
 *
 * `contacts/new` va **antes** que `contacts/:id`: si no, Angular intentaría
 * resolver "new" como un `:id` y nunca llegaría a la ruta de alta.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'contacts', pathMatch: 'full' },

  {
    path: 'contacts',
    loadComponent: () =>
      import('./features/contacts/contact-list/contact-list.page').then((m) => m.ContactListPage),
  },
  {
    path: 'contacts/new',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/contacts/contact-form/contact-form.page').then((m) => m.ContactFormPage),
  },
  {
    path: 'contacts/:id/edit',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/contacts/contact-form/contact-form.page').then((m) => m.ContactFormPage),
  },
  {
    path: 'contacts/:id',
    loadComponent: () =>
      import('./features/contacts/contact-detail/contact-detail.page').then(
        (m) => m.ContactDetailPage,
      ),
  },

  { path: '**', redirectTo: 'contacts' },
];
