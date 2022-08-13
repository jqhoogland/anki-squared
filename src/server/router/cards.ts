import { z } from "zod";
import { t } from "./context";

const cardsRouter = t.router({
    paginate: t.procedure.input(z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().default(0)
    })).query(async ({ input, ctx }) => {
        const items = await ctx.prisma.card.findMany({
            orderBy: {
                id: 'asc',
            },
            take: input.limit,
            skip: input.cursor,
            include: {
                note: true
            }
        })

        let nextCursor: number | null = null;
        if (items.length === input.limit) {
            nextCursor = input.cursor + input.limit;
        }

        return {
            items,
            nextCursor
        }
    })
})

export default cardsRouter