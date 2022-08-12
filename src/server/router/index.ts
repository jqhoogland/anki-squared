// src/server/router/index.ts
import { t } from "./context";

import cardsRouter from "./cards";
import notesRouter from './notes';

export const appRouter = t.router({
  cards: cardsRouter,
  notes: notesRouter
})

// export type definition of API
export type AppRouter = typeof appRouter;
