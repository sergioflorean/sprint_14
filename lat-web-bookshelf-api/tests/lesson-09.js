const BASE = 'http://localhost:3000';
let pass = 0;
let fail = 0;
let skip = 0;

class Skip extends Error {}

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
      if (value !== expected) throw new Error(`${label}: se esperaba ${expected}, se obtuvo ${value}`);
    },
    toBeTrue() {
      if (!value) throw new Error(`${label}: se esperaba un valor verdadero, se obtuvo ${String(value)}`);
    },
  };
}

async function run() {
  console.log('\nLección 09: Implementar operaciones CRUD para el recurso reviews\n');

  let bookId;
  let reviewId;

  await test(
    'POST /books — crea un libro',
    'Revisa que POST /books siga creando libros: createBook debe guardar con Book.create y responder 201 con el documento.',
    async () => {
      const res = await fetch(`${BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Foundation', genre: 'fiction', year: 1951 }),
      });
      expect(res.status, 'estado').toBe(201);
      const body = await res.json();
      expect(typeof body._id, 'tipo de _id').toBe('string');
      bookId = body._id;
    },
  );

  await test(
    'POST /reviews — crea una reseña vinculada al libro',
    'En createReview, lee bookId del body y guárdalo en el campo book: Review.create({ text, rating, book: bookId }); responde 201.',
    async () => {
      if (!bookId) throw new Skip('primero debe pasar POST /books');
      const res = await fetch(`${BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'A classic of science fiction.',
          rating: 5,
          bookId,
        }),
      });
      expect(res.status, 'estado').toBe(201);
      const body = await res.json();
      expect(typeof body._id, 'tipo de _id').toBe('string');
      expect(body.book, 'campo book').toBe(bookId);
      reviewId = body._id;
    },
  );

  await test(
    'GET /reviews — devuelve las reseñas con el campo book resuelto (populate)',
    'En getReviews, encadena .populate("book") a Review.find({}) para que cada reseña incluya el libro completo, no solo su ID.',
    async () => {
      if (!reviewId) throw new Skip('primero debe pasar POST /reviews');
      const res = await fetch(`${BASE}/reviews`);
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(Array.isArray(body), 'la respuesta es un arreglo').toBeTrue();

      const review = body.find(r => r._id === reviewId);
      expect(!!review, 'reseña encontrada en la lista').toBeTrue();
      expect(typeof review.book, 'tipo del campo book').toBe('object');
      expect(review.book._id, 'book._id resuelto (populate)').toBe(bookId);
    },
  );

  console.log(`\n${pass} superadas, ${fail} fallidas, ${skip} omitidas`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('d2Q5LWhwZmM=', 'base64').toString();
    console.log(`\nCódigo de verificación: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error('\nNo se pudo conectar con el servidor. Asegúrate de que esté corriendo en el puerto 3000.\n');
  process.exit(1);
});
