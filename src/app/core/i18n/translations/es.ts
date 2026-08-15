/**
 * Diccionario en español — **fuente de verdad** de las claves de traducción.
 *
 * `en.ts` y `fr.ts` se tipan con `satisfies TranslationDictionary` (derivado de
 * este archivo), así que si a cualquiera de los dos le falta una clave, o le
 * sobra una que no existe aquí, es un **error de compilación**, no un texto
 * roto que aparece hasta que alguien lo nota en producción.
 *
 * Claves con `{param}` admiten interpolación vía `I18nService.t(key, params)`.
 */
export const ES = {
  // ── App / barra global ────────────────────────────────────────────────────
  'app.title': 'Contactos',
  'app.language.es': 'Español',
  'app.language.en': 'Inglés',
  'app.language.fr': 'Francés',
  'app.language.switchAriaLabel': 'Cambiar idioma',

  // ── Lista ──────────────────────────────────────────────────────────────────
  'list.title': 'Contactos',
  'list.newButton': '+ Nuevo',
  'list.loading': 'Cargando contactos…',
  'list.searchPlaceholder': 'Buscar contacto…',
  'list.errorTitle': 'No se pudo cargar la lista',
  'list.retry': 'Reintentar',
  'list.emptyTitle': 'Aún no tienes contactos',
  'list.emptyDescription': 'Agrega el primero para empezar tu agenda.',
  'list.resetSeed': 'Restablecer datos de ejemplo',
  'list.resetSeedToast': 'Se restablecieron los datos de ejemplo.',
  'list.noResultsTitle': 'Sin resultados',
  'list.noResultsDescription': 'Prueba con otro término de búsqueda.',
  'list.countOne': '{visible} de {total} contacto',
  'list.countOther': '{visible} de {total} contactos',

  // ── Detalle ────────────────────────────────────────────────────────────────
  'detail.loading': 'Cargando…',
  'detail.back': 'Contactos',
  'detail.favoriteOn': '★ En favoritos',
  'detail.favoriteOff': '☆ Marcar como favorito',
  'detail.phonesTitle': 'Teléfonos',
  'detail.emailTitle': 'Correo',
  'detail.edit': 'Editar',
  'detail.delete': 'Eliminar',
  'detail.deleteConfirmTitle': '¿Eliminar contacto?',
  'detail.deleteConfirmMessage': 'Se eliminará a {name} de forma permanente.',
  'detail.notFoundTitle': 'Contacto no encontrado',
  'detail.backToList': 'Volver a la lista',
  'detail.deleteToastSuccess': 'Contacto eliminado.',
  'detail.deleteToastError': 'No se pudo eliminar el contacto.',

  // ── Formulario (alta y edición) ───────────────────────────────────────────
  'form.titleNew': 'Nuevo contacto',
  'form.titleEdit': 'Editar contacto',
  'form.notFound': 'No se encontró el contacto a editar.',
  'form.firstName': 'Nombre',
  'form.lastName': 'Apellido',
  'form.email': 'Correo (opcional)',
  'form.company': 'Empresa (opcional)',
  'form.phonesLegend': 'Teléfonos',
  'form.cancel': 'Cancelar',
  'form.save': 'Guardar',
  'form.saving': 'Guardando…',
  'form.discardTitle': '¿Descartar cambios?',
  'form.discardMessage': 'Perderás los cambios que no has guardado.',
  'form.discardConfirm': 'Descartar',
  'form.toastCreated': 'Contacto agregado.',
  'form.toastUpdated': 'Contacto actualizado.',
  'form.toastError': 'No se pudo guardar el contacto.',
  'form.unsavedChangesConfirm':
    'Tienes cambios sin guardar. ¿Seguro que quieres salir sin guardarlos?',

  // ── Teléfonos (bonus 2) ────────────────────────────────────────────────────
  'phone.mobile': 'Móvil',
  'phone.home': 'Casa',
  'phone.work': 'Trabajo',
  'phone.other': 'Otro',
  'phone.typeAriaLabel': 'Tipo de teléfono',
  'phone.numberPlaceholder': '10 dígitos',
  'phone.add': '+ Agregar teléfono',
  'phone.remove': 'Quitar teléfono {n}',

  // ── Validación (bonus 1) ──────────────────────────────────────────────────
  'errors.required': 'Este campo es obligatorio.',
  'errors.invalidName': 'Usa solo letras y espacios.',
  'errors.invalidPhone': 'Ingresa un teléfono de 10 dígitos.',
  'errors.duplicatePhone': 'Este teléfono ya está en la lista.',
  'errors.email': 'Ingresa un correo válido.',
  'errors.emailTaken': 'Ya existe un contacto con este correo.',
  'errors.maxlength': 'Se pasó del límite de caracteres.',
  'errors.minArrayLength': 'Agrega al menos un teléfono.',
  'errors.generic': 'Valor inválido.',
  'errors.loadContacts': 'No se pudo cargar la lista de contactos.',

  // ── Compartidos entre features ────────────────────────────────────────────
  'common.confirm': 'Confirmar',
  'common.closeDialog': 'Cerrar diálogo',
  'common.closeToast': 'Cerrar notificación',
  'common.searchAriaLabel': 'Buscar contacto',
  'common.clearSearch': 'Limpiar búsqueda',
  'common.addFavorite': 'Marcar como favorito',
  'common.removeFavorite': 'Quitar de favoritos',
  'common.favoriteUpdateError': 'No se pudo actualizar el favorito.',
} as const;

export type TranslationKey = keyof typeof ES;
export type TranslationDictionary = Record<TranslationKey, string>;
