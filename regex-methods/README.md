# Directorio de egresados

Proyecto de práctica para el capítulo de **expresiones regulares** del curso de
desarrollo web de TripleTen.

Es una pequeña API en Express con Mongoose que guarda egresados. Cada egresado
tiene un `username`, un `website` (su portafolio) y, opcionalmente, un
`graduationYear`.

## Puesta en marcha

```bash
npm install
npm run dev
```

## La tarea

El campo `website` del esquema, en `src/models/graduate.ts`, todavía acepta
cualquier texto. Añade un validador personalizado que solo permita direcciones
web válidas, conectando una regex con `test()` (igual que el campo `username`).

## Comprobar tu trabajo

Desde la raíz del proyecto, ejecuta:

```bash
node tests/lesson-03.js
```

Cuando todas las comprobaciones pasen, verás tu código de verificación.
