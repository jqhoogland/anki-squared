// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

export default async (req, res) => {
    console.log("Creating note:", req.body)
    return invoke("addNote", 6, {note: req.body}).then(({data}) => res.status(200).json({response: data}));
}
// invoke("modelNames")

