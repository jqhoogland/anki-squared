import React from "react"
import {AppBar, Box, Container, Grid, makeStyles, useScrollTrigger, Slide} from "@material-ui/core";
import Chooser from "./Chooser";
import LanguagePicker from "./LanguagePicker";
import {useDeck} from "./DeckProvider"

const useStyles = makeStyles({
    languagePicker: {marginLeft: "auto"}
})

const NavBar = ({window}) => {
    const {deckName, modelName, setDeck, setModel} = useDeck()
    const classes = useStyles()

    const trigger = useScrollTrigger({ target: window ? window() : undefined });

    return <Slide appear={false} direction="down" in={!trigger}>
        <AppBar color="secondary">
            <Container>
                <Box my={3}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Chooser label="Deck" chooseItem={setDeck} defaultItem={deckName} path="/api/decks"/>
                        </Grid>
                        <Grid item>
                            <Chooser label="Model" chooseItem={setModel} defaultItem={modelName} path="/api/models"/>
                        </Grid>
                        <Grid item className={classes.languagePicker}>
                            <LanguagePicker label="Language"/>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </AppBar>
    </Slide>
}

export default NavBar
