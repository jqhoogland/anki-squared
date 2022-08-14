import { Field, Note, NoteType, Prisma, Template } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import chalk from "chalk";
import { z } from "zod";
import { t } from "./context";

// Simple cache so we don't have to fire this with every pagination request
let graveIds: null | undefined | bigint[] = null;
const getGraveIds = async () => {
    if (graveIds) {
        return graveIds;
    }
    graveIds = await prisma?.grave.findMany().then(gs => gs.map(g => g.oid).filter(Boolean))

    return graveIds as bigint[]
}

// Faster during testing 
let notes: null | {
    items: (Note & {
        fields: string[];
        tags: string[];
        status: "queue" | "ready";
    })[], nextCursor: number | null
} = null

const notesRouter = t.router({
    paginate: t.procedure.input(z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.number().default(0),
        did: z.number().transform(BigInt).or(z.array(z.number()).transform(ns => ns.map(BigInt))).nullish(),
        status: z.enum(['queue', "ready"]).optional()
    })).query(async ({ input, ctx }) => {
        if (notes) {
            return notes
        }
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

        const graveIds = await getGraveIds();

        if (input.status === "queue") {
            statusFilters = {
                tags: { startsWith: " 1" }
            }
        } else if (input.status === "ready") {
            statusFilters = {
                NOT: { tags: { startsWith: " 1" }, id: { in: graveIds } }
            }
        }

        const items = (await ctx.prisma.note.findMany({
            where: {
                cards: cardFindArgs,
                NOT: { id: { in: graveIds } },
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

        notes = {
            items,
            nextCursor
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

    }),
    delete: t.procedure.input(z.object({ ids: z.array(z.bigint()) })).mutation(async ({ input: { ids: noteIds }, ctx }) => {
        const notes = await ctx.prisma?.note.findMany({ where: { id: { in: noteIds } }, include: { cards: true } });
        graveIds = null;

        const noteGraves = await Promise.all(noteIds.map(async noteId =>
            ctx.prisma?.grave.create({
                data:
                    ({
                        usn: -1,
                        oid: noteId,
                        type: 1
                    })
            })))
        console.log(chalk.red(`notes.delete CREATE NOTE GRAVE`), noteGraves.map(g => g.oid).join(', '))

        const cardIds = notes.flatMap(({ cards }) => cards.map(c => c.id));
        const cardGraves = await Promise.all(cardIds.map(async cardId =>
            ctx.prisma?.grave.create({
                data:
                    ({
                        usn: -1,
                        oid: cardId,
                        type: 0
                    })
            }))
        )
        console.log(chalk.red(`notes.delete CREATE CARD GRAVE `), cardGraves.map(g => g.oid).join(', '))

        await ctx.prisma.note.deleteMany({ where: { id: { in: noteIds } } })
            .then(res => console.log(chalk.red(`notes.delete DELETE NOTE`), res.count))
        await ctx.prisma.card.deleteMany({ where: { id: { in: cardIds } } })
            .then(res => console.log(chalk.red(`notes.delete DELETE CARD`), res.count))

        return {
            noteIds,
            cardIds,
        }
    }),
    // Will require an additional sync to take effect
    undelete: t.procedure.input(z.object({ noteIds: z.array(z.bigint()), cardIds: z.array(z.bigint()) })).mutation(async ({ input, ctx }) => {
        graveIds = null;

        const ungraved = await ctx.prisma.grave.deleteMany({
            where: {
                oid: { in: [...input.noteIds, ...input.cardIds] },
            }
        })

        console.log(chalk.green('notes.undelete DELETE CARD/NOTE GRAVE'), ungraved.count)

        return ungraved;
    }),
    update: t.procedure.input(z.object({ id: z.bigint(), fields: z.array(z.string()) })).mutation(async ({ input, ctx }) => {
        const note = await ctx.prisma?.note.findUnique({ where: { id: input.id } });

        if (!note) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found' });
        }

        console.log(chalk.green('notes.update UPDATE NOTE'), note.id)

        // TODO: Update csum
        const updated = await ctx.prisma.note.update({
            where: { id: note.id },
            data: { fields: input.fields.join(String.fromCharCode(31)), usn: -1, updatedAt: Math.round(new Date().getTime() / 1000) },
        })
        return updated;
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