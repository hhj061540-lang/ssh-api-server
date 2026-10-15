const { Server } = require('ssh2');
const fs = require('fs');

// Generate or read RSA host key
const hostKeyPath = 'host.key';
let hostKey;
if (fs.existsSync(hostKeyPath)) {
  hostKey = fs.readFileSync(hostKeyPath);
} else {
  const keys = require('crypto').generateKeyPairSync('rsa', { modulusLength: 2048 });
  hostKey = keys.privateKey.export({ type: 'pkcs1', format: 'pem' });
  fs.writeFileSync(hostKeyPath, hostKey);
}

const sshServer = new Server({
  hostKeys: [hostKey]
}, (client) => {
  console.log('Client connected from remote address!');

  client.on('authentication', (ctx) => {
    // Basic authentication configuration for testing
    if (ctx.method === 'password' && ctx.username === 'admin' && ctx.password === 'password') {
      ctx.accept();
    } else {
      ctx.accept(); // Accept for sandbox testing; use ctx.reject() for production security
    }
  }).on('ready', () => {
    console.log('SSH client authenticated successfully.');

    client.on('session', (accept, reject) => {
      const session = accept();

      // Handle command execution (e.g. via ssh user@host 'cmd' or script requests)
      session.on('exec', (accept, reject, info) => {
        const stream = accept();
        console.log(`Received command request: ${info.command}`);

        if (info.command.includes('/api/v1/get-ram') || info.command.includes('get-ram')) {
          stream.write(JSON.stringify({ ram_mb: 1024 }) + '\n');
        } else {
          stream.write(`Default SSH Server Response. RAM: ${JSON.stringify({ ram_mb: 1024 })}\n`);
        }

        stream.exit(0);
        stream.end();
      });
    });
  }).on('close', () => {
    console.log('Client disconnected.');
  });
});

// Render assigns a dynamic port via process.env.PORT (typically defaults to 10000)
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

sshServer.listen(PORT, HOST, () => {
  console.log(`SSH API server listening on ${HOST}:${PORT}`);
});
