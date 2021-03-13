import React, {useEffect} from "react"
import {Box, Card, CardActionArea, CardHeader, CircularProgress, Container, Grid, Typography} from "@material-ui/core";
import {AddCircle as AddCircleIcon  }from "@material-ui/icons"
import Link from "next/link"
import useSWR from "swr";
import {useDeck} from "../../providers/DeckProvider";
import _ from "lodash"
import {useRouter} from "next/router";
import NoteCreator from "../../components/NoteCreator";
import axios from "axios";



const Queue = ({}) => {
    const {modelName, setModel} = useDeck()
    const router = useRouter()
    const { nid } = router.query
    const {data} = useSWR(`/api/notes/${nid}`)
    const note = data?.response ?? false

    // const {noteId, modelName, tags, fields, cards} = note

    useEffect(() => {
        if (note && (modelName !== note.modelName)) {
            setModel(note.modelName)
        }
    }, [note])

    const handleCreate = async (newNote) => {
        console.log(`/api/notes/delete/${note.noteId}`)
        await axios.post(`/api/notes/delete/${note.noteId}`)
        await axios.post(`/api/notes/create`, newNote)
        router.push("/queue/")
    }

    return <Box my={5}><Container maxWidth="md">
        <Grid container spacing={5}>
            {!note ? <CircularProgress/> :
                <NoteCreator onCreate={handleCreate} defaultFields={_.mapValues(note.fields, "value")} defaultTags={note.tags}/>
            }
        </Grid>
    </Container>
    </Box>
}

export default Queue
