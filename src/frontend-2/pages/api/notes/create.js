// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

export default async (req, res) => {
    console.log("Creating note:", req.body)

    const {queue, ...note} = req.body
    const tags = queue ? [...note.tags, "queue"] : [...note.tags]

    const {data: { result: nid}} = await invoke("addNote", 6, {note: {...note, tags}});

    if (queue) {
        const { data: {result: cards}} = await invoke("findCards", 6, {query: `nid:${nid}`})
        invoke("suspend", 6, {cards})
    }
    return res.status(200).json({response: nid})
}

