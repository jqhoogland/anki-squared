// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

export default async (req, res) => {
    const {cid} = req.query
    console.log("Retrieving card info for", cid)

    const { data: {result}} = await invoke("cardsInfo", 6, {cards: [parseInt(cid)]})

    return res.status(200).json({response: (result ?? [null])[0]})
}

