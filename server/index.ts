import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import connectPg from 'connect-pg-simple';
import { db, pool } from './db.js'; // <-- import both Drizzle and pg.Pool for sessions
import { registerRoutes } from './routes.js';
import { storage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(express.json());

// Setup session store using pg.Pool (required by connect-pg-simple)
const PgSession = connectPg(session);
app.use(session({
  store: new PgSession({
    pool, // <-- use pool exported from db.js
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'pharmacy-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

registerRoutes(app);

async function startServer() {
  try {
    // Initialize default data using Drizzle
    await storage.initializeDefaultData();

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: process.cwd(),
      });
      app.use(vite.middlewares);
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
  }
}

startServer();
