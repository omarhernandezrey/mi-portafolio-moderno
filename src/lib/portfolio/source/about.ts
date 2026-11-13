/**
 * Intereses y datos personales de AboutSection.
 *
 * Estaban inline DENTRO del cuerpo del componente
 * `src/components/sections/AboutSection.tsx`, es decir: se reconstruían en cada
 * render y no se podían importar. Aquí salen como datos puros.
 *
 * Dos detalles que obligan a esta forma concreta:
 *
 * 1. `interestsData` llevaba el icono en JSX con props de presentación
 *    (`<Globe size={40} strokeWidth={1.5} />`). Se guarda `iconKey` y las
 *    props las sigue poniendo el componente, idénticas.
 *
 * 2. `personalData` no contenía texto: contenía CLAVES DE TRADUCCIÓN que el
 *    componente pasaba por `t()` (`t("about.personalData.name")`). El valor
 *    real vive en `src/locales/{es,en}/common.json`. Por eso aquí se guardan
 *    las claves (`labelKey` / `valueKey`) y no el texto: copiarlo lo habría
 *    duplicado y lo habría dejado desincronizado del i18n.
 *
 * Destino: tabla `portfolio_profile` (clave/valor por `section`), que es jsonb
 * libre, no una columna por campo.
 */
import type { PortfolioIconKey } from './icon-registry';

export interface PersonalInterest {
  readonly title: string;
  readonly href: string;
  readonly iconKey: PortfolioIconKey;
}

/** Campo de "datos personales": icono + dos claves de i18n. */
export interface PersonalDataField {
  readonly iconKey: PortfolioIconKey;
  /** Clave i18n de la etiqueta, p. ej. 'about.personalData.name'. */
  readonly labelKey: string;
  /** Clave i18n del valor, p. ej. 'about.personalInfo.fullName'. */
  readonly valueKey: string;
}

export const interestsData: PersonalInterest[] = [
  { title: "Open Source", href: "https://opensource.org/", iconKey: "Globe" },
  { title: "AI & ML", href: "https://ai.google/", iconKey: "BrainCircuit" },
  { title: "Clean Code", href: "https://www.codecademy.com/", iconKey: "Code2" },
  { title: "Tech Coffee", href: "https://confs.tech/", iconKey: "Coffee" },
];

export const personalData: PersonalDataField[] = [
  {
    iconKey: 'FaUser',
    labelKey: 'about.personalData.name',
    valueKey: 'about.personalInfo.fullName',
  },
  {
    iconKey: 'FaMapMarkerAlt',
    labelKey: 'about.personalData.address',
    valueKey: 'about.personalInfo.location',
  },
  {
    iconKey: 'FaPhoneAlt',
    labelKey: 'about.personalData.phone',
    valueKey: 'about.personalInfo.phoneNumber',
  },
];

/** Conteo de intereses. */
export const INTERESTS_COUNT: number = interestsData.length;

/** Conteo de campos de datos personales. */
export const PERSONAL_DATA_COUNT: number = personalData.length;
