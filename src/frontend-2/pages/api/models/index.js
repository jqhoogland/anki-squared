// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

export default async (req, res) =>
    invoke("modelNames").then(({data}) => res.status(200).json({response: data}));

