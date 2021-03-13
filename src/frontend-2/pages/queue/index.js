import React, {useEffect, useState} from "react"
import {
    Box, Button,
    Card,
    CardActionArea, CardActions,
    CardHeader,
    CircularProgress,
    Container, Divider,
    Grid, IconButton,
    TextField,
    Typography
} from "@material-ui/core";
import {AddCircle as AddCircleIcon  }from "@material-ui/icons"
import Link from "next/link"
import useSWR from "swr";
import {useDeck} from "../../providers/DeckProvider";
import _ from "lodash"
import {useQueue} from "../../providers/QueueProvider";
import TextSelector from "../../components/Field/TextSelector";
import axios from "axios";

const QueueNote = ({index, noteId, modelName, tags, fields, cards}) => {
    const repField = _.find(fields, {"order": 0})

    return (<Card>
        <Link passHref href={`/queue/${index}`}>
            <CardActionArea>
                <CardHeader title={<Typography variant="h5">{repField.value}</Typography>}/>
            </CardActionArea>
        </Link>
    </Card>
    )
}

const Queue = ({}) => {
    const { queue: notes, addNote } = useQueue()
    const {deckName, modelName, fieldNames} = useDeck()
    const [value, setValue] = useState("")


    const submit = () => {
        const note = {
            deckName,
            modelName,
            fields: _.zipObject(fieldNames, fieldNames.map((_, i) => i === 0 ? value : "")),
            tags: [],
            audio: [],
            video: [],
            picture: [],
        }

        axios.post(`/api/notes/create`, {
            ...note,
            queue: true
        })

        addNote({
            ...note,
            fields: Object.values(note.fields).map((value="", order) => ({value, order})),
            tags: ["queue"]
        })

        setValue("")
    }

    return <Box my={5}><Container maxWidth="md">
        <Box my={10}>

        <Grid container spacing={5}>
            {!notes ? <CircularProgress/> :
            notes.map(({noteId, modelName, tags, fields, cards}, index) => (
                <Grid item xs={12}>
                <QueueNote index={index} noteId={noteId} modelName={modelName} tags={tags} fields={fields} cards={cards}/>
                </Grid>
            ))}
        </Grid>
        </Box>
        <Divider />
        <Box my={10}>
        <Card variant="outlined">
            <TextSelector visible={true} value={value} handleReturn={submit} label={`Add ${modelName}`} updateText={setValue} refreshOnReturn/>
            <CardActions>
                <IconButton onClick={submit}>
                    <AddCircleIcon/>
                </IconButton>
            </CardActions>
        </Card>
        </Box>
        <Box my={10}>
        <Link href="/queue/bulk-add" passHref>
        <Button component="a" variant="contained" color="primary">Bulk Add</Button>
        </Link>
        </Box>
    </Container>
    </Box>
}

export default Queue
