let Graduate;
let pass = 0;
let fail = 0;

async function loadModel() {
  try {
    const m = await import("../src/models/graduate.ts");
    Graduate = m.default;
  } catch (error) {
    throw new Error("No se pudo cargar el modelo Graduate", { cause: error });
  }
}

async function test(label, hint, fn) {
  try {
    await fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch {
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
    throw new Error(`se esperaba un error de validación en '${path}'`);
  }
}

async function expectNoError(doc, path) {
  const err = await getValidationError(doc);
  if (err && err.errors[path]) {
    throw new Error(
      `no se esperaba un error en '${path}': ${err.errors[path].message}`,
    );
  }
}

// rot13 evita que el código de verificación aparezca en texto plano aquí.
function rot13(str) {
  return str.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

console.log("\nLección 3: Métodos de las expresiones regulares\n");

await loadModel();

// Direcciones válidas → NO deben producir un error de validación en website.
const validWebsites = [
  "https://ejemplo.com",
  "http://www.mi-sitio.com",
  "https://mi-sitio.io",
  "HTTPS://EJEMPLO.COM",
];

// Direcciones inválidas → SÍ deben producir un error de validación en website.
const invalidWebsites = [
  "banana",
  "ejemplo.com",
  "http://",
  "https://ejemplo",
  "ftp://ejemplo.com",
];

for (const site of validWebsites) {
  await test(
    `website acepta una dirección válida: ${site}`,
    "Revisa que tu regex acepte direcciones con http:// o https://, un dominio y una extensión (.com, .io...).",
    async () => {
      await expectNoError(
        new Graduate({ username: "ana_dev", website: site }),
        "website",
      );
    },
  );
}

for (const site of invalidWebsites) {
  await test(
    `website rechaza una dirección inválida: ${site}`,
    "Conecta la regex al campo website con un validador personalizado y test(), para que rechace lo que no tenga forma de dirección web.",
    async () => {
      await expectError(
        new Graduate({ username: "ana_dev", website: site }),
        "website",
      );
    },
  );
}

await test(
  "un egresado con username y website válidos pasa la validación",
  "Un documento con un username correcto y una dirección web válida no debería tener ningún error de validación.",
  async () => {
    const doc = new Graduate({ username: "ana_dev", website: "https://ana.dev" });
    await expectNoError(doc, "website");
    await expectNoError(doc, "username");
  },
);

console.log(`\n${pass} superadas, ${fail} fallidas`);

if (fail === 0) {
  console.log(`\nCódigo de verificación: ${rot13("EGRESADO")}`);
} else {
  process.exit(1);
}
