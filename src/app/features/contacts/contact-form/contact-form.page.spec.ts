import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Contact } from '../../../core/models/contact.model';
import { ContactStore } from '../../../core/services/contact-store.service';
import { ToastService } from '../../../core/services/toast.service';
import { ContactFormPage } from './contact-form.page';

const EXISTING: Contact = {
  id: 'existing-1',
  firstName: 'Beto',
  lastName: 'Cruz',
  email: 'beto@correo.mx',
  company: null,
  phones: [{ id: 'p1', label: 'mobile', number: '5511112222' }],
  favorite: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ContactFormPage', () => {
  let fixture: ComponentFixture<ContactFormPage>;
  let component: ContactFormPage;
  let storeSpy: jasmine.SpyObj<Pick<ContactStore, 'status' | 'load' | 'findById' | 'emailsExcept' | 'create' | 'update'>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  async function setup(id?: string): Promise<void> {
    fixture = TestBed.createComponent(ContactFormPage);
    component = fixture.componentInstance;

    // Router real (necesario para que RouterLink resuelva ActivatedRoute);
    // solo se espían los métodos que nos interesa comprobar.
    const router = TestBed.inject(Router);
    routerSpy = router as unknown as jasmine.SpyObj<Router>;
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    if (id !== undefined) fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('ContactStore', ['status', 'load', 'findById', 'emailsExcept', 'create', 'update']);
    storeSpy.status.and.returnValue('loaded');
    storeSpy.load.and.returnValue(Promise.resolve([]));
    storeSpy.findById.and.returnValue(undefined);
    storeSpy.emailsExcept.and.returnValue([]);

    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

    TestBed.configureTestingModule({
      imports: [ContactFormPage],
      providers: [
        provideRouter([]),
        { provide: ContactStore, useValue: storeSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });
  });

  describe('modo alta (sin id)', () => {
    beforeEach(() => setup(undefined));

    it('arranca con una fila de teléfono y el formulario limpio', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.phones.length).toBe(1);
      expect(component.form.pristine).toBeTrue();
    });

    it('no envía y marca los campos si el formulario es inválido', async () => {
      await component.onSubmit();

      expect(storeSpy.create).not.toHaveBeenCalled();
      expect(component.form.controls.firstName.touched).toBeTrue();
    });

    it('valida el teléfono a 10 dígitos MX', () => {
      const phone = component.phones.at(0);
      phone.get('number')?.setValue('123');
      expect(phone.get('number')?.errors).toEqual({ invalidPhone: true });

      phone.get('number')?.setValue('5511112222');
      expect(phone.get('number')?.errors).toBeNull();
    });

    it('crea el contacto y navega a su detalle al guardar', async () => {
      const created: Contact = { ...EXISTING, id: 'brand-new' };
      storeSpy.create.and.returnValue(Promise.resolve(created));

      component.form.patchValue({ firstName: 'Beto', lastName: 'Cruz' });
      component.phones.at(0).patchValue({ label: 'mobile', number: '5511112222' });

      await component.onSubmit();

      expect(storeSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          firstName: 'Beto',
          lastName: 'Cruz',
          email: null,
          phones: [jasmine.objectContaining({ label: 'mobile', number: '5511112222' })],
        }),
      );
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/contacts', 'brand-new']);
      expect(toastSpy.success).toHaveBeenCalled();
    });

    it('no permite guardar con menos de un teléfono (bonus 2)', () => {
      component.phones.removeAt(0);
      expect(component.phones.errors).toEqual({ minArrayLength: { required: 1, actual: 0 } });
      expect(component.form.invalid).toBeTrue();
    });

    it('cancelar sin cambios navega directo a la lista', () => {
      component.onCancel();
      expect(component.confirmingDiscard()).toBeFalse();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/contacts');
    });

    it('cancelar con cambios pide confirmación antes de salir', () => {
      component.form.controls.firstName.setValue('Cambié esto');
      component.form.markAsDirty();

      component.onCancel();
      expect(component.confirmingDiscard()).toBeTrue();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();

      component.confirmDiscard();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/contacts');
    });

    it('hasUnsavedChanges refleja el estado "dirty" del formulario', () => {
      expect(component.hasUnsavedChanges()).toBeFalse();
      component.form.markAsDirty();
      expect(component.hasUnsavedChanges()).toBeTrue();
    });
  });

  describe('modo edición (con id)', () => {
    beforeEach(async () => {
      storeSpy.findById.and.returnValue(EXISTING);
      await setup(EXISTING.id);
    });

    it('precarga los datos del contacto existente', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.form.controls.firstName.value).toBe('Beto');
      expect(component.phones.length).toBe(1);
      expect(component.form.pristine).toBeTrue();
    });

    it('actualiza el contacto existente al guardar', async () => {
      storeSpy.update.and.returnValue(Promise.resolve(EXISTING));
      component.form.controls.lastName.setValue('Cruz López');

      await component.onSubmit();

      expect(storeSpy.update).toHaveBeenCalledWith('existing-1', jasmine.objectContaining({ lastName: 'Cruz López' }));
    });
  });

  describe('modo edición con id inexistente', () => {
    it('marca notFound si el contacto no existe', async () => {
      storeSpy.findById.and.returnValue(undefined);
      await setup('missing-id');
      expect(component.notFound()).toBeTrue();
    });
  });
});
