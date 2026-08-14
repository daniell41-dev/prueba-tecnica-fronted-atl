import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
  const pipe = new InitialsPipe();

  it('devuelve la inicial de nombre y apellido en mayúsculas', () => {
    expect(pipe.transform('ana', 'gonzalez')).toBe('AG');
  });

  it('funciona solo con nombre', () => {
    expect(pipe.transform('ana')).toBe('A');
  });

  it('devuelve "?" cuando no hay nombre ni apellido', () => {
    expect(pipe.transform('', null)).toBe('?');
    expect(pipe.transform(null, null)).toBe('?');
  });
});
