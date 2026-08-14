import { FormArray, FormControl, FormGroup } from '@angular/forms';

import {
  mxPhoneValidator,
  minArrayLength,
  nameValidator,
  uniqueEmailValidator,
  uniquePhonesValidator,
} from './contact.validators';

describe('nameValidator', () => {
  const validator = nameValidator();

  it('acepta nombres con acentos, ñ y espacios', () => {
    expect(validator(new FormControl('José Ángel'))).toBeNull();
    expect(validator(new FormControl('Ana Sofía Muñoz'))).toBeNull();
  });

  it('rechaza nombres con dígitos o símbolos', () => {
    expect(validator(new FormControl('Ana3'))).toEqual({ invalidName: true });
    expect(validator(new FormControl('Ana@'))).toEqual({ invalidName: true });
  });

  it('no valida un campo vacío (lo cubre Validators.required aparte)', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });
});

describe('mxPhoneValidator', () => {
  const validator = mxPhoneValidator();

  it('acepta un número de 10 dígitos con o sin formato', () => {
    expect(validator(new FormControl('5512345678'))).toBeNull();
    expect(validator(new FormControl('55 1234 5678'))).toBeNull();
  });

  it('rechaza números con menos o más de 10 dígitos', () => {
    expect(validator(new FormControl('551234567'))).toEqual({ invalidPhone: true });
    expect(validator(new FormControl('55123456789'))).toEqual({ invalidPhone: true });
  });

  it('no valida un campo vacío', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });
});

describe('minArrayLength', () => {
  it('falla cuando el arreglo tiene menos elementos que el mínimo', () => {
    const array = new FormArray<FormControl<string>>([]);
    expect(minArrayLength(1)(array)).toEqual({ minArrayLength: { required: 1, actual: 0 } });
  });

  it('pasa cuando el arreglo cumple el mínimo', () => {
    const array = new FormArray([new FormControl('x')]);
    expect(minArrayLength(1)(array)).toBeNull();
  });
});

describe('uniquePhonesValidator', () => {
  function phoneGroup(number: string): FormGroup {
    return new FormGroup({ number: new FormControl(number) });
  }

  it('no marca nada cuando todos los números son distintos', () => {
    const array = new FormArray([phoneGroup('5512345678'), phoneGroup('5587654321')]);
    expect(uniquePhonesValidator()(array)).toBeNull();
    expect(array.at(0).get('number')?.errors).toBeNull();
    expect(array.at(1).get('number')?.errors).toBeNull();
  });

  it('marca duplicatePhone en cada control repetido (mismos dígitos, distinto formato)', () => {
    const array = new FormArray([phoneGroup('55 1234 5678'), phoneGroup('5512345678')]);
    const result = uniquePhonesValidator()(array);
    expect(result).toEqual({ duplicatePhones: true });
    expect(array.at(0).get('number')?.errors).toEqual({ duplicatePhone: true });
    expect(array.at(1).get('number')?.errors).toEqual({ duplicatePhone: true });
  });

  it('conserva otros errores del control al limpiar duplicatePhone', () => {
    const group = phoneGroup('123');
    group.get('number')?.setErrors({ invalidPhone: true });
    const array = new FormArray([group, phoneGroup('5512345678')]);

    uniquePhonesValidator()(array);

    expect(array.at(0).get('number')?.errors).toEqual({ invalidPhone: true });
  });
});

describe('uniqueEmailValidator', () => {
  it('rechaza un email ya usado por otro contacto (sin distinguir mayúsculas)', () => {
    const validator = uniqueEmailValidator(() => ['ana@correo.mx']);
    expect(validator(new FormControl('ANA@correo.mx'))).toEqual({ emailTaken: true });
  });

  it('acepta un email libre', () => {
    const validator = uniqueEmailValidator(() => ['ana@correo.mx']);
    expect(validator(new FormControl('otra@correo.mx'))).toBeNull();
  });

  it('no valida un campo vacío (el email es opcional)', () => {
    const validator = uniqueEmailValidator(() => ['ana@correo.mx']);
    expect(validator(new FormControl(''))).toBeNull();
  });
});
