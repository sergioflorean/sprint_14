import { isValidObjectId } from 'mongoose';

const BASE = 'http://localhost:3000';
let pass = 0;
let fail = 0;
let skip = 0;

class Skip extends Error { }

async function test(label, hint, fn) {
  try {
    await fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    if (err instanceof Skip) {
      console.log(`○ ${label}`);
      console.log(`   → ${err.message}`);
      skip++;
    } else {
      console.log(`❌ ${label}`);
      console.log(`   → ${hint}`);
      fail++;
    }
  }
}

function expect(value, label) {
  return {
    toBe(expected) {
      if (value !== expected)
        throw new Error(`${label}: se esperaba ${expected}, se obtuvo ${value}`);
    },
    toBeTrue() {
      if (!value)
        throw new Error(`${label}: se esperaba un valor verdadero, se obtuvo ${String(value)}`);
    },
    toBeDefined() {
      if (value === undefined)
        throw new Error(`${label}: se esperaba un valor definido, se obtuvo ${String(value)}`);
    },
  };
}

async function run() {
  console.log('\nLección 06: Creación, lectura, actualización y eliminación de documentos\n');

  let bookId;

  await test(
    'El servidor está corriendo en el puerto 3000',
    'Inicia el servidor con npm run dev y confirma que escucha en el puerto 3000 antes de correr las pruebas.',
    async () => {
      try {
        const res = await fetch(`${BASE}`);
        expect(res).toBeDefined();
      } catch (error) {
        throw new Error('No se pudo conectar');
      }
    },
  );

  await test(
    'POST /books — crea un libro con estado 201',
    'En createBook, guarda el libro con Book.create(...) y responde con res.status(201) y el documento creado.',
    async () => {
      const res = await fetch(`${BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Dune', genre: 'fiction', year: 1965 }),
      });
      expect(res.status, 'estado').toBe(201);
      const body = await res.json();
      expect(typeof body._id, 'tipo de _id').toBe('string');
      expect(body.title, 'título').toBe('Dune');
      expect(isValidObjectId(body._id), '_id es un ObjectId válido').toBeTrue();
      bookId = body._id;
    },
  );

  await test(
    'GET /books — devuelve un arreglo de libros',
    'En getBooks, usa Book.find({}) y envía el arreglo resultante con res.send(...).',
    async () => {
      const res = await fetch(`${BASE}/books`);
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(Array.isArray(body), 'la respuesta es un arreglo').toBeTrue();
    },
  );

  await test(
    'GET /books/:id — devuelve un libro por su ID',
    'En getBookById, busca el libro con Book.findById(req.params.id) y devuélvelo.',
    async () => {
      if (!bookId) throw new Skip('primero debe pasar POST /books');
      const res = await fetch(`${BASE}/books/${bookId}`);
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(body._id, '_id').toBe(bookId);
    },
  );

  await test(
    'PATCH /books/:id — actualiza el título',
    'En updateBook, usa Book.findByIdAndUpdate con { new: true } para devolver el libro ya actualizado.',
    async () => {
      if (!bookId) throw new Skip('primero debe pasar POST /books');
      const res = await fetch(`${BASE}/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Dune Messiah' }),
      });
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(body.title, 'título actualizado').toBe('Dune Messiah');
    },
  );

  await test(
    'DELETE /books/:id — elimina un libro',
    'En deleteBook, elimina el libro con Book.findByIdAndDelete(req.params.id) y responde con el documento eliminado.',
    async () => {
      if (!bookId) throw new Skip('primero debe pasar POST /books');
      const res = await fetch(`${BASE}/books/${bookId}`, { method: 'DELETE' });
      expect(res.status, 'estado').toBe(200);
    },
  );

  console.log(`\n${pass} superadas, ${fail} fallidas, ${skip} omitidas`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('eGs3LXZ3cXo=', 'base64').toString();
    console.log(`\nCódigo de verificación: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error(
    '\nNo se pudo conectar con el servidor. Asegúrate de que esté corriendo en el puerto 3000.\n',
  );
  process.exit(1);
});
