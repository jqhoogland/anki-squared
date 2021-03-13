import React from "react"
import {Box, Card, CardActionArea, CardHeader, CircularProgress, Container, Grid, Typography} from "@material-ui/core";
import {AddCircle as AddCircleIcon  }from "@material-ui/icons"
import Link from "next/link"
import useSWR from "swr";
import {useDeck} from "../../providers/DeckProvider";
import _ from "lodash"
import {useQueue} from "../../providers/QueueProvider";

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
    const { queue: notes } = useQueue()
    return <Box my={5}><Container maxWidth="md">
        <Grid container spacing={5}>
            {!notes ? <CircularProgress/> :
            notes.map(({noteId, modelName, tags, fields, cards}, index) => (
                <Grid item xs={12}>
                <QueueNote index={index} noteId={noteId} modelName={modelName} tags={tags} fields={fields} cards={cards}/>
                </Grid>
            ))}
        </Grid>
    </Container>
    </Box>
}

export default Queue
