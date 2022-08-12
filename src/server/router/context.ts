// src/server/router/context.ts
import * as trpc from "@trpc/server";
import { initTRPC } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";
import { prisma } from "../db/client";

export const createContext = (opts?: trpcNext.CreateNextContextOptions) => {
  const req = opts?.req;
  const res = opts?.res;

  return {
    req,
    res,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();

export const t = initTRPC<{
  ctx: Context;
}>()({
  /* optional */
  transformer: superjson,
  // errorFormatter: [...]
});
