// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

// type AnkiCard = {
//     answer: string
//     cardId: int,
//     css: string,
//     deckName: string
//     due: int,
//     factor: int
//     fieldOrder: int,
//     fields: {[fieldName]: {value: string, order: number}},
//     interval: int,
//     lapses: int,
//     left: int,
//     modelName: string,
//     note: int,
//     ord: int
//     question:string,
//     queue: int
//     reps: int
//     type: int
// }

export default async (req, res) => {
    const {cid} = req.query
    console.log("Retrieving card info for", cid)

    const { data: {result}} = await invoke("cardsInfo", 6, {cards: [parseInt(cid)]})

    return res.status(200).json({response: (result ?? [null])[0]})
}

