import React, {createContext, useState, useContext, useEffect} from "react"
import {useDeck} from "./DeckProvider";
import useSWR from "swr";
import _ from "lodash"

const QueueContext = createContext()


const QueueProvider = ({children}) => {
    const {deckName} = useDeck()
    const [queue, setQueue] = useState(false)
    const {data} = useSWR(`/api/notes/queue/${encodeURI(deckName)}`)

    useEffect(()=> {
        setQueue(data?.response ?? false)
    }, data)

    const getNote = (nid) => _.find(queue, "noteId")
    const getNoteFromIndex = (nidx) => queue[nidx]
    const addNote = (note) => setQueue([...queue, note])

    return <QueueContext.Provider value={{queue, getNote, getNoteFromIndex, addNote}}>
        {children}
    </QueueContext.Provider>
}

export default QueueProvider

export const useQueue = () => {
    const queuesContext = useContext(QueueContext)
    return queuesContext
}
