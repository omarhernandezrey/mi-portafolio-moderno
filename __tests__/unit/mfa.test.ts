import { necesitaDesafioMfa } from '@/lib/admin/mfa';

describe('necesitaDesafioMfa', () => {
  it('sin ningún factor enrolado (todo en aal1), no exige nada', () => {
    expect(necesitaDesafioMfa({ currentLevel: 'aal1', nextLevel: 'aal1' })).toBe(false);
  });

  it('con un factor verificado y la sesión sin completar el desafío, lo exige', () => {
    expect(necesitaDesafioMfa({ currentLevel: 'aal1', nextLevel: 'aal2' })).toBe(true);
  });

  it('con el desafío ya completado en esta sesión, no lo vuelve a pedir', () => {
    expect(necesitaDesafioMfa({ currentLevel: 'aal2', nextLevel: 'aal2' })).toBe(false);
  });

  it('con currentLevel null (sin sesión resuelta aún), no revienta', () => {
    expect(necesitaDesafioMfa({ currentLevel: null, nextLevel: 'aal2' })).toBe(true);
    expect(necesitaDesafioMfa({ currentLevel: null, nextLevel: null })).toBe(false);
  });
});
