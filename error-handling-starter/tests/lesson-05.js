import {
  check,
  makeRequest,
  build,
  startServer,
  printResults,
} from './utils.js';

async function main() {
  console.log('Lección 5: Asignar códigos de estado a los errores\n');

  const results = [];

  build();

  const { server } = await startServer();

  try {
    const r1 = await makeRequest({ path: '/users/1', method: 'GET' });
    results.push(
      check(
        'GET /users/1 debe seguir devolviendo 200',
        r1.status === 200,
        'getUserById debe devolver 200 para un ID de usuario válido. Si incluso /users/1 falla, revisa que hayas quitado la línea temporal (null as any).crash() de la práctica anterior.',
      ),
    );

    const r2 = await makeRequest({ path: '/users/abc', method: 'GET' });
    results.push(
      check(
        'GET /users/abc debe devolver 400',
        r2.status === 400,
        'Asigna statusCode = 400 al error antes de lanzarlo cuando el ID no es un número válido.',
      ),
    );
    results.push(
      check(
        'GET /users/abc debe enviar el mensaje de error específico (no el texto genérico del 500)',
        r2.json?.success === false &&
          r2.json?.data === null &&
          typeof r2.json?.error === 'string' &&
          !r2.json?.error.includes('Ha ocurrido un error en el servidor'),
        'Cuando statusCode es 400, errorHandler debe enviar err.message — no el texto genérico de error del servidor.',
      ),
    );

    const r3 = await makeRequest({ path: '/users/99', method: 'GET' });
    results.push(
      check(
        'GET /users/99 debe devolver 404',
        r3.status === 404,
        'Asigna statusCode = 404 al error antes de lanzarlo cuando no se encuentra al usuario.',
      ),
    );
    results.push(
      check(
        'GET /users/99 debe enviar el mensaje de error específico',
        r3.json?.success === false &&
          r3.json?.data === null &&
          typeof r3.json?.error === 'string' &&
          !r3.json?.error.includes('Ha ocurrido un error en el servidor'),
        'Cuando statusCode es 404, errorHandler debe enviar err.message.',
      ),
    );
  } finally {
    server.kill();
  }

  printResults(results, 'ATTACHED');
}

main().catch((err) => {
  console.log('');
  console.log(`❌ Error del ejecutor de pruebas: ${err.message}`);
  console.log('');
  process.exit(1);
});
