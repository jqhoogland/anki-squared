// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {invoke} from "../../../utils"

export default async (req, res) => {
    console.log("Searching images for:", req.body.query)
    return res.status(200).json({response: [
            {img: "https://source.unsplash.com/random/200x200", title: "random.png"},
            {img: "https://source.unsplash.com/random/200x200", title: "random.png"},
            {img: "https://source.unsplash.com/random/200x200", title: "random.png"},
        ]});
}
// invoke("modelNames")

