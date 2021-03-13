import React, {createContext, useState, useContext} from "react"
import {useDeck} from "./DeckProvider";
import useSWR from "swr";
import _ from "lodash"

const QueueContext = createContext()


const QueueProvider = ({children}) => {
    const {deckName} = useDeck()
    const {data} = useSWR(`/api/notes/queue/${encodeURI(deckName)}`)
    const queue = data?.response ?? false

    const getNote = (nid) => _.find(queue, "noteId")
    const getNoteFromIndex = (nidx) => queue[nidx]

    return <QueueContext.Provider value={{queue, getNote, getNoteFromIndex}}>
        {children}
    </QueueContext.Provider>
}

export default QueueProvider

export const useQueue = () => {
    const queuesContext = useContext(QueueContext)
    return queuesContext
}
