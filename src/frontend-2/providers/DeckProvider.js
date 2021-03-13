import React, {createContext, useState, useContext, useEffect} from "react"
import useSWR from "swr";

const DeckContext = createContext()

const useResource = (defaultValue, path) => {
    const [resourceName, setResource] = useState(defaultValue)
    const {data} = useSWR(path, (url) => window.fetch(url).then(res => res.json()), {revalidateOnReconnect: false, revalidateOnFocus: false})
    const options = data?.response ?? [defaultValue]

    useEffect(() => {
        if (options && options.length > 0) {
            setResource(options[0])
        }
    }, [options])

    return [resourceName, options, setResource]
}

const DeckProvider = ({children}) => {
    const [deckName, decks, setDeck] = useResource("Default", "/api/decks")
    const [modelName, models, setModel] = useResource("Basic", "/api/models")

    return <DeckContext.Provider value={{deckName, decks, setDeck, modelName, models, setModel}}>
        {children}
    </DeckContext.Provider>
}

export default DeckProvider

export const useDeck = () => {
    const decksContext = useContext(DeckContext)
    return decksContext
}
