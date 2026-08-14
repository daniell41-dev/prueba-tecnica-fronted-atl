import { PhoneFormatPipe } from './phone-format.pipe';

describe('PhoneFormatPipe', () => {
  const pipe = new PhoneFormatPipe();

  it('separa un número de 10 dígitos en grupos 2-4-4', () => {
    expect(pipe.transform('5512345678')).toBe('55 1234 5678');
  });

  it('devuelve el valor original si no tiene 10 dígitos', () => {
    expect(pipe.transform('123')).toBe('123');
  });

  it('devuelve cadena vacía para valores nulos o vacíos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
