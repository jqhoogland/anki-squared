import React from "react"
import {Card, CardActionArea, CardHeader, Container, Grid, Typography} from "@material-ui/core";
import {List as ListIcon,AddCircle as AddCircleIcon  }from "@material-ui/icons"
import Link from "next/link"

const Queue = () => {
    return <Container maxWidth="md">
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <Link passHref href="/queue">
                        <CardActionArea>
                            <CardHeader title={<Typography variant="h5">Queue</Typography>} avatar={<ListIcon/>}/>
                        </CardActionArea>
                    </Link>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <Link passHref href="/add">
                        <CardActionArea>
                            <CardHeader title={<Typography variant="h5">Quick add</Typography>} avatar={<AddCircleIcon/>}/>
                        </CardActionArea>
                    </Link>
                </Card>
            </Grid>
        </Grid>
    </Container>
}

export default Queue
