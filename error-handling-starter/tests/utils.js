import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import http from 'http';

const PROJECT_ROOT = process.cwd();

if (!fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))) {
  console.log('');
  console.log(
    '❌ Ejecuta esta prueba desde la raíz de tu proyecto Express (la carpeta que contiene package.json).',
  );
  console.log('');
  process.exit(1);
}

function check(label, condition, hint) {
  return { pass: Boolean(condition), label, hint };
}

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    let bodyStr = null;
    const extraHeaders = {};

    if (body !== undefined) {
      bodyStr = JSON.stringify(body);
      extraHeaders['Content-Type'] = 'application/json';
      extraHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        method: 'GET',
        ...options,
        headers: { ...extraHeaders, ...(options.headers || {}) },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            // pass
          }
          resolve({ status: res.statusCode, body: data, json });
        });
      },
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function build() {
  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
  } catch {
    console.log('');
    console.log(
      '❌ La compilación falló. Ejecuta `npm run build` para ver el error.',
    );
    console.log('');
    process.exit(1);
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [path.join(PROJECT_ROOT, 'dist/index.js')], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let serverOutput = '';
    let started = false;

    const timeout = setTimeout(() => {
      if (!started) {
        server.kill();
        reject(
          new Error(
            'El servidor no arrancó en 3 segundos. Verifica que tu servidor llame a app.listen().',
          ),
        );
      }
    }, 3000);

    const onData = (data) => {
      serverOutput += data.toString();
      if (!started && serverOutput.includes('puerto')) {
        started = true;
        clearTimeout(timeout);
        resolve({ server, getOutput: () => serverOutput });
      }
    };

    server.stdout.on('data', onData);
    server.stderr.on('data', (data) => {
      serverOutput += data.toString();
    });
    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function rot13(str) {
  return str.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function printResults(results, encodedCode) {
  console.log('');
  results.forEach(({ pass, label, hint }) => {
    console.log(`${pass ? '✅' : '❌'} ${label}`);
    if (!pass && hint) console.log(`   → ${hint}`);
  });
  console.log('');

  const passed = results.filter((r) => r.pass).length;
  const allPassed = passed === results.length;
  console.log(
    `${allPassed ? '🎉 ' : ''}${passed}/${results.length} verificaciones superadas.`,
  );

  if (allPassed) {
    console.log(`\nTu código de verificación: ${rot13(encodedCode)}`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

export {
  check,
  makeRequest,
  build,
  startServer,
  printResults,
  rot13,
  PROJECT_ROOT,
};
