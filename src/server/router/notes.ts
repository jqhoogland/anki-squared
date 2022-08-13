import { Field, Note, NoteType, Prisma, Template } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "./context";

const notesRouter = t.router({
    paginate: t.procedure.input(z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().default(0),
        did: z.number().transform(BigInt).or(z.array(z.number()).transform(ns => ns.map(BigInt))).nullish(),
        status: z.enum(['queue', "ready"]).optional()
    })).query(async ({ input, ctx }) => {
        let cardFindArgs: true | Prisma.CardListRelationFilter = { some: {} };

        if (typeof input.did === 'bigint') {
            cardFindArgs = {
                some: {
                    did: input.did
                }
            }
        } else if (Array.isArray(input.did)) {
            cardFindArgs = {
                some: {
                    did: { in: input.did }
                }
            }
        }

        let statusFilters = {}

        if (input.status === "queue") {
            statusFilters = {
                tags: { startsWith: " 1" }
            }
        } else if (input.status === "ready") {
            statusFilters = {
                NOT: { tags: { startsWith: " 1" } }
            }
        }

        const items = (await ctx.prisma.note.findMany({
            where: {
                cards: cardFindArgs,
                ...statusFilters
            },
            orderBy: [
                {
                    "id": "desc"
                }
            ],
            take: input.limit,
            skip: input.cursor,
        })).map(parseNote)

        let nextCursor: number | null = null;
        if (items.length === input.limit) {
            nextCursor = input.cursor + input.limit;
        }

        return {
            items,
            nextCursor
        }
    }),
    types: t.procedure.query(({ ctx }) => ctx.prisma.noteType.findMany({
        include: {
            fields: true,
            templates: true,
        },
    }).then(noteTypes => noteTypes.map(parseNoteType))),

    status: t.router({
        toggle: t.procedure.input(z.object({ id: z.bigint() })).mutation(async ({ input, ctx }) => {
            const note = await ctx.prisma?.note.findUnique({ where: input });

            if (!note) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found' });
            }

            // We track status by setting the first tag to a number
            const newTags = note.tags.startsWith(" 1 ") ? note.tags.slice(3) : " 1 " + note.tags;

            return ctx.prisma.note.update({
                where: { id: note.id },
                data: { tags: newTags, usn: -1 },
            })
        })

    })
})

export default notesRouter

export const parseNote = <T extends Note>(note: T) => ({
    ...note,
    fields: (note.fields ?? "").split(String.fromCharCode(31)),
    tags: (note.tags ?? "").split(" ").filter(Boolean),
    status: note.tags.startsWith(" 1 ") ? "queue" as const : "ready" as const
})

export type ParsedNote = ReturnType<typeof parseNote<Note>>


const parseWithConfig = <T extends { config: Buffer }>(item: T) => ({
    ...item,
    config: item.config.toString('ascii'),
})

const parseNoteType = <T extends NoteType & { templates: Template[], fields: Field[] }>(noteType: T) => parseWithConfig({
    ...noteType,
    // Possibly a security issue
    fields: noteType.fields.map(parseWithConfig),
    templates: noteType.templates.map(parseWithConfig),
})


export type ParsedNoteType = ReturnType<typeof parseNoteType<NoteType & { templates: Template[], fields: Field[] }>>