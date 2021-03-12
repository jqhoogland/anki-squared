import {image_search} from "duckduckgo-images-api"

const getFileNameFromUrl = (url) => {
    if (url) {
        const tmp = url.split('/');
        const tmpLength = tmp.length;

        return tmpLength ? tmp[tmpLength - 1] : '';
    }

    return '';
};

export default async (req, res) => {
    return res.status(200).json({
        response: (
            await image_search({query: req.body.query,})
        )
            .slice(0, 5) // TODO Pagination
            .map(({image, ...rest}) => ({img: image, filename: getFileNameFromUrl(image), ...rest}))
    })
}

