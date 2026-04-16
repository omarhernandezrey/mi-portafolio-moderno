# Secretos
Esta carpeta NO se sube a git (está en .gitignore). Aquí guarda copias cifradas de tus claves
para no perderlas si formateas la PC o cambias de equipo.

## Cifrado Recomendado (con age)
1. Instala age (https://github.com/FiloSottile/age) — es gratis y multiplataforma.
2. Genera una llave personal una sola vez: `age-keygen -o ~/.config/age/key.txt`
3. Guarda la PUBLIC KEY en este archivo abajo (puedes anotarla aquí mismo).
4. Cifra tu archivo `.env.local`:
   `age -r <tu-clave-publica> -o secrets/env.local.age .env.local`
5. Para descifrar en otra máquina:
   `age -d -i ~/.config/age/key.txt secrets/env.local.age > .env.local`

## Qué NO subir aquí (ni a ningún lado)
- La llave privada (`~/.config/age/key.txt`).
- Tu archivo `.env.local` sin cifrar.

---
**Clave Pública Registrada:** 
(Anota aquí tu clave age1...)
