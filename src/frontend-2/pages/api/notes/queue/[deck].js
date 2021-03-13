// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import _ from "lodash"
import {invoke} from "../../../../utils"

export default async (req, res) => {
    const {deck} = req.query
    console.log("Retrieving queue for", deck)

    /**
     * Queue items are:
     * 1. Tagged "queue"
     * 2. Suspended
     */
    const { data: {result: cids}} = await invoke("findCards", 6, {query: `tag:queue deck:"${deck}" is:suspended`})
    const { data: {result: cards}} = await invoke("cardsInfo", 6, {cards: cids})
    const nids = _.map(cards, "note")
    const { data: {result: notes}} = await invoke("notesInfo", 6, {notes: nids})

    return res.status(200).json({response: notes})
}

