import _ from "lodash"
import React, {useEffect, useState} from "react"
import {Box, Button, CircularProgress, Container, Grid,} from "@material-ui/core"
import useSWR from "swr"
import axios from "axios"

import Chooser from "../components/Chooser";
import Field from "../components/Field"
import TagPanel from "../components/TagPanel"

const createCardOptions = {
    "allowDuplicate": false,
}


export default function Home() {
    const [deckName, setDeck] = useState("Default")
    const [modelName, setModel] = useState("Basic")
    const [fields, setFields] = useState({})
    const [tags, setTags] = useState([])

    const {data: fieldsResponse, error} = useSWR(`/api/models/fields/${modelName}`)
    const fieldNames = fieldsResponse?.response?.result ?? []

    useEffect(() => {
        if (fieldNames && fieldNames.length > 0) {
            const _fields = _.zipObject(fieldNames, fieldNames.map((_, i) => {
                if (i < Object.keys(fields).length) {
                    return Object.values(fields)[i]
                }
                return ""
            }))
            setFields(_fields)
        }
    }, [fieldNames])

    const audio = []
    const picture = []
    const video = []

    const handleCreate = () => {
        axios.post(`/api/notes/create`, {
            deckName,
            modelName,
            fields,
            options: createCardOptions,
            tags,
            audio,
            video,
            picture
        })
    }

    const handleChangeField = (fieldName, value) => {
        setFields({...fields, [fieldName]: value})
    }

    return (
        <Container maxWidth="md">
            <Grid container spacing={2}>
                <Grid item>
                    <Chooser label="Deck" chooseItem={setDeck} defaultItem={deckName} path="/api/decks"/>
                </Grid>
                <Grid item>
                    <Chooser label="Model" chooseItem={setModel} defaultItem={modelName} path="/api/models"/>
                </Grid></Grid>
            <Box mt={2}>
                <Grid container spacing={2}>
                    {!fieldNames.length && <Grid item sm={12}><CircularProgress/></Grid>}
                    {fieldNames.map(fieldName => (
                        <Grid item sm={6} xs={12}>
                            <Field label={fieldName} updateField={handleChangeField}/>
                        </Grid>)
                    )}
                    <Grid item xs={12}>
                        <Box my={5}>
                            <Button color="primary" variant="contained" onClick={handleCreate}>Create</Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <TagPanel defaultTags={tags} updateTags={setTags}/>

                    </Grid>
                </Grid>
            </Box>
        </Container>
    )
}
