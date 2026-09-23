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
  console.log('Lección 4: Middleware para el manejo de errores en Express\n');

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
      'src/middleware/error-handler.ts debe existir',
      fs.existsSync(errorMiddlewarePath),
      'Crea src/middleware/error-handler.ts y define ahí tu función errorHandler.',
    ),
  );

  results.push(
    check(
      'src/middleware/error-handler.ts debe definir una función errorHandler',
      errorMiddlewareSrc.includes('errorHandler'),
      'Define una función llamada errorHandler y expórtala desde src/middleware/error-handler.ts.',
    ),
  );

  // Los manejadores de errores tienen 4 parámetros — la firma de 4 argumentos es lo que
  // Express usa para distinguir el middleware de manejo de errores del middleware normal.
  results.push(
    check(
      'errorHandler debe aceptar 4 parámetros (err, req, res, next)',
      /function errorHandler\s*\([^)]*err[^)]*,[^)]*req[^)]*,[^)]*res[^)]*,[^)]*_?next/.test(
        errorMiddlewareSrc,
      ) ||
        /errorHandler\s*=\s*\([^)]*err[^)]*,[^)]*req[^)]*,[^)]*res[^)]*,[^)]*_?next/.test(
          errorMiddlewareSrc,
        ),
      'El middleware de manejo de errores debe tener 4 parámetros: (err, req, res, next). Express usa la cantidad de parámetros para identificar los manejadores de errores — si quitas uno, los errores nunca llegarán a él.',
    ),
  );

  results.push(
    check(
      'src/index.ts debe importar desde middleware/error-handler',
      indexSrc.includes('middleware/error'),
      'Importa errorHandler desde ./middleware/error-handler.js en src/index.ts.',
    ),
  );

  results.push(
    check(
      'src/index.ts debe registrar errorHandler con app.use()',
      indexSrc.includes('app.use(errorHandler)'),
      'Registra el manejador de errores en src/index.ts con app.use(errorHandler). Debe ir después de app.use(router).',
    ),
  );

  // errorHandler debe ir después de las rutas
  const routerIdx = indexSrc.indexOf('app.use(router)');
  const errorHandlerIdx = indexSrc.indexOf('app.use(errorHandler)');
  results.push(
    check(
      'errorHandler debe registrarse después de app.use(router)',
      routerIdx !== -1 && errorHandlerIdx !== -1 && errorHandlerIdx > routerIdx,
      'Mueve app.use(errorHandler) para que vaya después de app.use(router) — el manejador de errores debe ser el último middleware registrado.',
    ),
  );

  build();

  const { server } = await startServer();

  try {
    const r1 = await makeRequest({ path: '/users/1', method: 'GET' });
    results.push(
      check(
        'GET /users/1 debe devolver 200',
        r1.status === 200,
        'Asegúrate de que getUserById siga devolviendo una respuesta 200 para un ID numérico válido.',
      ),
    );
    results.push(
      check(
        'La respuesta de GET /users/1 debe ser { success: true, data: { id: 1, ... }, error: null }',
        r1.json?.success === true &&
          r1.json?.data?.id === 1 &&
          r1.json?.error === null,
        'getUserById debe responder con { success: true, data: <usuario>, error: null } cuando encuentra al usuario.',
      ),
    );

    const r2 = await makeRequest({ path: '/users/abc', method: 'GET' });
    results.push(
      check(
        'GET /users/abc debe devolver un estado de error (4xx o 5xx)',
        r2.status >= 400,
        'getUserById debe lanzar un error cuando el parámetro id no es un número válido. Asegúrate de que errorHandler esté registrado para atraparlo.',
      ),
    );
    results.push(
      check(
        'La respuesta de GET /users/abc debe ser { success: false, data: null, error: <string> }',
        r2.json?.success === false &&
          r2.json?.data === null &&
          typeof r2.json?.error === 'string',
        'errorHandler debe responder con { success: false, data: null, error: <string> }.',
      ),
    );
  } finally {
    server.kill();
  }

  printResults(results, 'HANDLER');
}

main().catch((err) => {
  console.log('');
  console.log(`❌ Error del ejecutor de pruebas: ${err.message}`);
  console.log('');
  process.exit(1);
});
