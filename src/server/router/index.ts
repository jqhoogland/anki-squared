// src/server/router/index.ts
import { t } from "./context";

import cardsRouter from "./cards";
import decksRouter from './decks';
import notesRouter from './notes';

export const appRouter = t.router({
  cards: cardsRouter,
  notes: notesRouter,
  decks: decksRouter
})

// export type definition of API
export type AppRouter = typeof appRouter;
