import { Field, Note, NoteType, Prisma, Template } from "@prisma/client";
import { z } from "zod";
import { t } from "./context";

const notesRouter = t.router({
    paginate: t.procedure.input(z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.number().default(0),
        did: z.string().or(z.array(z.string())).nullish(),
    })).query(async ({ input, ctx }) => {
        let cardFindArgs: true | Prisma.CardListRelationFilter = { some: {} };

        if (typeof input.did === 'string') {
            cardFindArgs = {
                some: {
                    did: BigInt(input.did)
                }
            }
        } else if (Array.isArray(input.did)) {
            cardFindArgs = {
                some: {
                    did: { in: input.did.map(BigInt) }
                }
            }
        }

        const items = (await ctx.prisma.note.findMany({
            where: {
                cards: cardFindArgs,
            },
            orderBy: {
                id: 'asc'
            },
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
    }).then(noteTypes => noteTypes.map(parseNoteType)))
})

export default notesRouter

export const parseNote = <T extends Note>(note: T) => ({
    ...note,
    fields: (note.fields ?? "").split(String.fromCharCode(31)),
})

export type ParsedNote = Omit<Note, 'fields'> & { fields: string[] }


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