import { Deck, PrismaClient } from "@prisma/client";
import { t } from "./context";

const listDecks = async (prisma: PrismaClient) => prisma.deck.findMany().then(decks => decks.map(parseDeck));


const decksRouter = t.router({
    list: t.procedure.query(({ ctx }) => listDecks(ctx.prisma)),
    hierarchy: t.procedure.query(async ({ ctx }) => {
        const deckList = ((await listDecks(ctx.prisma))
            .sort((a, b) => a.parents.length - b.parents.length));

        return getHierarchy(deckList);
    })
})

export default decksRouter

export const parseDeck = <T extends Deck>(deck: T) => {
    const path = deck.name.split(String.fromCharCode(31));
    return ({
        ...deck,
        _name: deck.name,
        parents: path.slice(0, path.length - 1),
        name: path[path.length - 1],
        common: deck.common.toString("ascii"),
        kind: deck.kind.toString("ascii"),
    })
}

export type ParsedDeck = ReturnType<typeof parseDeck<Deck>>;
export type DeckWithChildren = ParsedDeck & { children?: DeckWithChildren[] }

const getByFullName = (decks: DeckWithChildren[], name: string) => decks.find(deck => deck._name === name);

export const getHierarchy = (decks: DeckWithChildren[]) => {
    const hierarchy: DeckWithChildren[] = [];
    for (const deck of decks) {
        const parent = deck.parents.length > 0 ? getByFullName(decks, deck.parents.join(String.fromCharCode(31))) : null;
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push(deck);
        } else {
            hierarchy.push(deck);
        }
    }
    return hierarchy;
}