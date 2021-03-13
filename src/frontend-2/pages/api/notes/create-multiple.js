// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"
import _ from "lodash"

export default async (req, res) => {
    console.log("Creating notes:", req.body.notes, _.map(req.body.notes, "fields"))

    const addToQueue = req.body.notes[0].queue

    const notes = req.body.notes.map(({ tags, queue, ...note}) => ({
        ...note,
        tags: queue ? [...tags, "queue"] : [...tags]
    }))

    const {data: {result: nids}} = await invoke("addNotes", 6, {notes});

    if (addToQueue) {
        nids.forEach((nid) => {
            (async () => {
                const {data: {result: cards}} = await invoke("findCards", 6, {query: `nid:${nid} `})
                invoke("suspend", 6, {cards})
            })()
        })
    }

    return res.status(200).json({response: nids})
}

