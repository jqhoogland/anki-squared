import {image_search} from "duckduckgo-images-api"
import { getFileNameFromUrl} from "../../../utils";

export default async (req, res) => {
    return res.status(200).json({
        response: (
            await image_search({query: req.body.query,})
        )
            .slice(0, 5) // TODO Pagination
            .map(({image, ...rest}) => ({img: image, filename: getFileNameFromUrl(image), ...rest}))
    })
}

