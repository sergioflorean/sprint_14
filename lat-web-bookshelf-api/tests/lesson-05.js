let Book;
let Review;
let pass = 0;
let fail = 0;

async function loadModels() {
  try {
    const b = await import('../src/models/book.js');
    const r = await import('../src/models/review.js');
    Book = b.default;
    Review = r.default;
  } catch (error) {
    throw new Error('No se pudieron cargar los modelos');
  }
}

async function test(label, hint, fn) {
  try {
    await fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    console.log(`❌ ${label}`);
    console.log(`   → ${hint}`);
    fail++;
  }
}

async function getValidationError(doc) {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err;
  }
}

async function expectError(doc, path) {
  const err = await getValidationError(doc);
  if (!err || !err.errors[path]) {
    throw new Error(`se esperaba un error de validación en '${path}', pero no hubo ninguno`);
  }
}

async function expectNoError(doc, path) {
  const err = await getValidationError(doc);
  if (err && err.errors[path]) {
    throw new Error(`no se esperaba un error de validación en '${path}', pero se obtuvo: ${err.errors[path].message}`);
  }
}

console.log('\nLección 05: Esquemas y modelos\n');

// ── Modelo Review ──────────────────────────────────────────────────────────────

await loadModels();

await test(
  'Review — el modelo está definido',
  'Crea el modelo con mongoose.model("Review", reviewSchema) y expórtalo por defecto en src/models/review.ts.',
  () => {
    if (typeof Review !== 'function') throw new Error('El modelo Review exportado no es válido');
  },
);

await test(
  'Review — text es obligatorio',
  'Marca el campo text como required: true en el esquema de Review.',
  async () => {
    await expectError(new Review({ rating: 4 }), 'text');
  },
);

await test(
  'Review — text exige una longitud mínima de 5',
  'Añade minlength: 5 al campo text del esquema de Review.',
  async () => {
    await expectError(new Review({ text: 'hi', rating: 4 }), 'text');
  },
);

await test(
  'Review — text exige una longitud máxima de 500',
  'Añade maxlength: 500 al campo text del esquema de Review.',
  async () => {
    await expectError(new Review({ text: 'x'.repeat(501), rating: 4 }), 'text');
  },
);

await test(
  'Review — rating es obligatorio',
  'Marca el campo rating como required: true en el esquema de Review.',
  async () => {
    await expectError(new Review({ text: 'Great book!' }), 'rating');
  },
);

await test(
  'Review — un documento válido pasa la validación',
  'Revisa que text y rating no tengan reglas de más: un Review con un text válido y un rating numérico debe pasar la validación.',
  async () => {
    await expectNoError(new Review({ text: 'Great book!', rating: 5 }), 'text');
    await expectNoError(new Review({ text: 'Great book!', rating: 5 }), 'rating');
  },
);

// ── Modelo Book ────────────────────────────────────────────────────────────────
await test(
  'Book — el modelo está definido',
  'Crea el modelo con mongoose.model("Book", bookSchema) y expórtalo por defecto en src/models/book.ts.',
  () => {
    if (typeof Book !== 'function') throw new Error('El modelo Book exportado no es válido');
  },
);

await test(
  'Book — title es obligatorio',
  'Marca el campo title como required: true en el esquema de Book.',
  async () => {
    await expectError(new Book({ genre: 'fiction' }), 'title');
  },
);

await test(
  'Book — title exige una longitud mínima de 2',
  'Añade minlength: 2 al campo title del esquema de Book.',
  async () => {
    await expectError(new Book({ title: 'X', genre: 'fiction' }), 'title');
  },
);

await test(
  'Book — title exige una longitud máxima de 100',
  'Añade maxlength: 100 al campo title del esquema de Book.',
  async () => {
    await expectError(new Book({ title: 'x'.repeat(101), genre: 'fiction' }), 'title');
  },
);

await test(
  'Book — genre es obligatorio',
  'Marca el campo genre como required: true en el esquema de Book.',
  async () => {
    await expectError(new Book({ title: 'Dune' }), 'genre');
  },
);

await test(
  'Book — genre rechaza valores fuera del enum',
  'Restringe genre con enum a los valores permitidos: fiction, non-fiction, biography, science e history.',
  async () => {
    await expectError(new Book({ title: 'Dune', genre: 'fantasy' }), 'genre');
  },
);

await test(
  'Book — genre acepta todos los valores válidos del enum',
  'Revisa que el enum de genre incluya los cinco valores: fiction, non-fiction, biography, science e history.',
  async () => {
    for (const g of ['fiction', 'non-fiction', 'biography', 'science', 'history']) {
      await expectNoError(new Book({ title: 'Dune', genre: g }), 'genre');
    }
  },
);

await test(
  'Book — year es opcional',
  'Define year como Number sin required, para que un Book sin year siga siendo válido.',
  async () => {
    await expectNoError(new Book({ title: 'Dune', genre: 'fiction' }), 'year');
  },
);

await test(
  'Book — tags es un arreglo',
  'Define tags como un arreglo de strings: tags: [{ type: String, minlength: 2, maxlength: 20 }].',
  async () => {
    const doc = new Book({ title: 'Dune', genre: 'fiction', tags: ['scifi', 'epic'] });
    const err = await getValidationError(doc);
    if (err) throw new Error(`error de validación inesperado: ${err.message}`);
    if (!Array.isArray(doc.tags)) throw new Error('tags no es un arreglo');
  },
);

console.log(`\n${pass} superadas, ${fail} fallidas`);

if (fail === 0) {
  const code = Buffer.from('cGsyLXJqeXQ=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}
if (fail > 0) process.exit(1);
