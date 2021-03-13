// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"


export default async (req, res) => {
    const {nid} = req.query
    console.log("Retrieving note info for", nid)

    const { data: {result}} = await invoke("notesInfo", 6, {notes: [parseInt(nid)]})

    return res.status(200).json({response: (result ?? [null])[0]})
}

