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
  console.log('\nLección 08: Crear relaciones\n');

  let bookId;

  await test(
    'GET /books — el servidor está corriendo y el modelo Book funciona',
    'Confirma que el servidor está corriendo y que GET /books responde con un arreglo (revisa getBooks y el modelo Book).',
    async () => {
      const res = await fetch(`${BASE}/books`);
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(Array.isArray(body), 'la respuesta es un arreglo').toBeTrue();
    },
  );

  await test(
    'POST /books — la respuesta incluye un campo reviews',
    'Agrega el campo reviews al esquema de Book como un arreglo de referencias: reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }].',
    async () => {
      const res = await fetch(`${BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'The Left Hand of Darkness', genre: 'fiction', year: 1969 }),
      });
      expect(res.status, 'estado').toBe(201);
      const body = await res.json();
      expect(Array.isArray(body.reviews), 'el campo reviews es un arreglo').toBeTrue();
      bookId = body._id;
    },
  );

  await test(
    'GET /books/:id — el documento book incluye el arreglo reviews',
    'Con el campo reviews en el esquema de Book, cada libro devuelto debe incluir su arreglo reviews (vacío si aún no tiene reseñas).',
    async () => {
      if (!bookId) throw new Skip('primero debe pasar POST /books');
      const res = await fetch(`${BASE}/books/${bookId}`);
      expect(res.status, 'estado').toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.reviews), 'el campo reviews es un arreglo').toBeTrue();
    },
  );

  console.log(`\n${pass} superadas, ${fail} fallidas, ${skip} omitidas`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('bmYzLXFod3g=', 'base64').toString();
    console.log(`\nCódigo de verificación: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error('\nNo se pudo conectar con el servidor. Asegúrate de que esté corriendo en el puerto 3000.\n');
  process.exit(1);
});
