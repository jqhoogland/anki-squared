import React, {createContext, useState, useContext} from "react"

const DeckContext = createContext()


const DeckProvider = ({children}) => {
    const [deckName, setDeck] = useState("Default")
    const [decks, setDecks] = useState(["Default"])

    const [modelName, setModel] = useState("Basic")
    const [models, setModels] = useState(["Basic"])

    return <DeckContext.Provider value={{deckName, decks, setDeck, modelName, models, setModel}}>
        {children}
    </DeckContext.Provider>
}

export default DeckProvider

export const useDeck = () => {
    const decksContext = useContext(DeckContext)
    return decksContext
}
