import axios from "axios"

export default async (req, res) => {
    const word = req.body.query.toLowerCase().split(" ")[0] // If multiple words, take only the first
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${req.body.language}/${word}`)
    return res.status(200).json({
        response: response.data
    })
}

