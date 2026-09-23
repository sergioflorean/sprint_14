import fs from 'fs';
import path from 'path';
import {
  check,
  makeRequest,
  build,
  startServer,
  printResults,
  PROJECT_ROOT,
} from './utils.js';

async function main() {
  console.log('Lección 6: Manejar 404s y rutas desconocidas\n');

  const results = [];

  const errorMiddlewarePath = path.join(
    PROJECT_ROOT,
    'src/middleware/error-handler.ts',
  );
  const errorMiddlewareSrc = fs.existsSync(errorMiddlewarePath)
    ? fs.readFileSync(errorMiddlewarePath, 'utf8')
    : '';
  const indexSrc = fs.existsSync(path.join(PROJECT_ROOT, 'src/index.ts'))
    ? fs.readFileSync(path.join(PROJECT_ROOT, 'src/index.ts'), 'utf8')
    : '';

  results.push(
    check(
      'src/middleware/error-handler.ts debe definir una función notFoundHandler',
      errorMiddlewareSrc.includes('notFoundHandler'),
      'Agrega una función notFoundHandler a src/middleware/error-handler.ts y expórtala.',
    ),
  );

  results.push(
    check(
      'src/index.ts debe registrar notFoundHandler con app.use()',
      indexSrc.includes('app.use(notFoundHandler)'),
      'Importa notFoundHandler desde ./middleware/error-handler.js y regístralo con app.use(notFoundHandler).',
    ),
  );

  // notFoundHandler debe registrarse antes que errorHandler (atrapa rutas sin coincidencia,
  // no errores lanzados — por eso va entre las rutas y el manejador de errores)
  const notFoundIdx = indexSrc.indexOf('app.use(notFoundHandler)');
  const errorHandlerIdx = indexSrc.indexOf('app.use(errorHandler)');
  results.push(
    check(
      'notFoundHandler debe registrarse antes que errorHandler',
      notFoundIdx !== -1 &&
        errorHandlerIdx !== -1 &&
        notFoundIdx < errorHandlerIdx,
      'Registra notFoundHandler antes que errorHandler en src/index.ts. Atrapa las rutas sin coincidencia; errorHandler atrapa los errores lanzados.',
    ),
  );

  build();

  const { server } = await startServer();

  try {
    const r1 = await makeRequest({ path: '/unicorns', method: 'GET' });
    results.push(
      check(
        'GET /unicorns debe devolver 404',
        r1.status === 404,
        'notFoundHandler debe responder con estado 404 para cualquier ruta que no exista.',
      ),
    );
    results.push(
      check(
        'La respuesta de GET /unicorns debe ser { success: false, data: null, error: <string> }',
        r1.json?.success === false &&
          r1.json?.data === null &&
          typeof r1.json?.error === 'string',
        'notFoundHandler debe responder con { success: false, data: null, error: <string> }.',
      ),
    );

    const r2 = await makeRequest({ path: '/users', method: 'GET' });
    results.push(
      check(
        'GET /users debe seguir devolviendo 200',
        r2.status === 200,
        'Asegúrate de que agregar el manejador de rutas no encontradas no haya roto la ruta /users existente.',
      ),
    );

    const r3 = await makeRequest({ path: '/users/1', method: 'GET' });
    results.push(
      check(
        'GET /users/1 debe seguir devolviendo 200',
        r3.status === 200,
        'Asegúrate de que GET /users/:id siga funcionando después de agregar el manejador de rutas no encontradas.',
      ),
    );

    const r4 = await makeRequest({ path: '/users/abc', method: 'GET' });
    results.push(
      check(
        'GET /users/abc debe seguir devolviendo un estado de error (errorHandler sigue funcionando)',
        r4.status >= 400,
        'errorHandler debe seguir atrapando los errores lanzados por los route handlers.',
      ),
    );
  } finally {
    server.kill();
  }

  printResults(results, 'NOTFOUND');
}

main().catch((err) => {
  console.log('');
  console.log(`❌ Error del ejecutor de pruebas: ${err.message}`);
  console.log('');
  process.exit(1);
});
