import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';
import { authMiddleware } from './services/auth.js';
import mongoose from 'mongoose';
import cors from 'cors'; // Import cors

interface Context {
  user?: { _id: any };
}

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});


app.use(express.static(path.join(__dirname, 'client/dist')));

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      return authMiddleware({ req });
    },
  })
);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on http://localhost:${PORT}`);
  });
});


