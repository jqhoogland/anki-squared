// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../../utils"

export default async (req, res) => {
    const {nid} = req.query
    console.log("Deleting note", nid)

    await invoke("deleteNotes", 6, {notes: [parseInt(nid)]})

    return res.status(200).json({response: true})
}

