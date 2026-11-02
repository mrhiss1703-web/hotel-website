import {defineConfig} from 'vite';

export default defineConfig(({command}) => ({
  base: command === 'build' ? './' : '/',
  build: {rollupOptions: {input: 'dev.html'}},
  plugins: [{
    name: 'development-entry',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') req.url = '/dev.html';
        next();
      });
    },
  }],
}));
