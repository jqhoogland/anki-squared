import React, {useState} from "react"
import {
    Box,
    Card,
    CardActionArea,
    CardHeader,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Typography,
    TextField,
    FormControl, CardContent, CardActions, IconButton
} from "@material-ui/core";
import {AddCircle as AddCircleIcon, ArrowDownwardRounded, Close} from "@material-ui/icons"
import Link from "next/link"
import useSWR from "swr";
import {useDeck} from "../../providers/DeckProvider";
import _ from "lodash"
import {useQueue} from "../../providers/QueueProvider";
import axios from "axios";

const BulkAdd = ({}) => {
    const {deckName, modelName, fieldNames} = useDeck()
    const {  addNote } = useQueue()
    const [bulk, setBulk] = useState(false)
    const [value, setValue] = useState("")

    const convert= () => {
        setBulk(value.split(/\r?\n/))
        setValue("")
    }

    const submitNote = (text) => {
        console.log(text)
        const note =

        console.log(text)



    }

    const submit = () => {
        const notes = bulk.map((text) => ({
            deckName,
            modelName,
            fields: _.zipObject(fieldNames, fieldNames.map((_, i) => i === 0 ? text : "")),
            tags: [],
            audio: [],
            video: [],
            picture: [],
            queue: true
        }))

        axios.post(`/api/notes/create-multiple`, {
            notes
        })

        setBulk(false)

        notes.forEach(({queue, ...note}) =>   addNote({
            ...note,
            fields: Object.values(note.fields).map((value="", order) => ({value, order})),
            tags: ["queue"]
        }))
    }

    const removeIdx = index => setBulk(bulk.filter((_, i) => i !== index))

    return <Container maxWidth="md">
            <Box my={20}>
                <Box my={5}>

                <Card>
                    <CardContent>
                <FormControl fullWidth variant="outlined">
                <TextField id="outlined-basic" label="Bulk Add"
                           multiline
                           value={value}
                           onChange={({target: {value}}) => setValue(value)}
                />
                </FormControl>
                    </CardContent>
                    <CardActions>
                        <IconButton onClick={convert}>
                            <ArrowDownwardRounded/>
                        </IconButton>
                    </CardActions>
                </Card>
                </Box>
                <Box my={5}>
                <Grid container spacing={5}>
            <Divider/>
            {bulk &&
                bulk.map((value, index) => (
                    <Grid item xs={12} key={`key${index}`}>
                        <Card>
                            <CardHeader
                                title={<Typography>{value}</Typography>}
                                action={<IconButton onClick={() => removeIdx(index)}><Close/></IconButton>}
                            />
                        </Card>
                    </Grid>
                ))}
                   </Grid>
                </Box>
                <IconButton onClick={submit} disabled={!bulk}>
                    <AddCircleIcon/>
                </IconButton>
            </Box>
    </Container>
}

export default BulkAdd
