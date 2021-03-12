import forvoApi from "forvo"

const forvo = forvoApi({ key: process.env.FORVO_API_KEY });

export default async (req, res) => {
    return res.status(200).json({
        response: await forvo.standardPronunciation({ word: req.body.query.toLowerCase(), language: req.body.language })
    })
}

