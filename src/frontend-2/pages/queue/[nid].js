import React from "react"
import {Box, Card, CardActionArea, CardHeader, CircularProgress, Container, Grid, Typography} from "@material-ui/core";
import {AddCircle as AddCircleIcon  }from "@material-ui/icons"
import Link from "next/link"
import useSWR from "swr";
import {useDeck} from "../../components/DeckProvider";
import _ from "lodash"
import {useRouter} from "next/router";

const QueueNote = ({noteId, modelName, tags, fields, cards}) => {
    const repField = _.find(fields, {"order": 0})

    return (<Card>
            <Link passHref href={`/queue/${noteId}`}>
                <CardActionArea>
                    <CardHeader title={<Typography variant="h5">{repField.value}</Typography>}/>
                </CardActionArea>
            </Link>
        </Card>
    )
}

const Queue = ({}) => {
    const router = useRouter()
    const { nid } = router.query
    const {data} = useSWR(`/api/notes/${nid}`)
    const note = data?.response ?? false

    console.log(note)
    return <Box my={5}><Container maxWidth="md">
        <Grid container spacing={5}>
            {!note ? <CircularProgress/> :
                <QueueNote {...note}/>
            }
        </Grid>
    </Container>
    </Box>
}

export default Queue
