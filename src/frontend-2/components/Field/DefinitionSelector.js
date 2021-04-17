import {
    Box,
    Card,
    CardActions,
    CardContent,
    Chip,
    Collapse,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
    Typography
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Search, Subtitles} from "@material-ui/icons";
import {useLanguage} from "../../providers/LanguageProvider";

const useStyles = makeStyles(theme => ({
    margin: {
        margin: "auto"
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    definition: {
        width: "100%",
        height: "100%"
    },
    selected: {
        borderWidth: 5
    }
}));

const DefinitionCard = ({definition}) => {
    const classes = useStyles()
    return <Card variant="outlined">
        <CardContent>
            <Typography variant="h5" style={{
                marginLeft: "auto",
                marginBottom: 20,
            }}>{definition?.partOfSpeech}</Typography>
            <Typography>{definition.definition}</Typography>
            {definition?.example && <Typography color="textSecondary"><i>{definition?.example}</i></Typography>}
        </CardContent>
        <Divider/>
        <CardActions>
            <CardContent>
                {(definition?.synonyms ?? []).map(synonym => <Chip label={synonym} size="small" variant="outlinede"
                                                                   style={{margin: 1}}/>)}
            </CardContent>
        </CardActions>
    </Card>
}


const DefinitionSelector = ({visible, defaultQuery = "", updateSelection}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)
    const [selection, _setSelection] = useState([])
    const [options, setOptions] = useState([])
    const {language} = useLanguage()

    const searchQuery = () => {
        axios.post("/api/resources/definitions", {query, language}).then(({data}) => {
            const definition = data?.response ?? []
            if (definition && definition?.length > 0) {
                // TODO: Use more of this info
                setOptions(
                    _.flatMap(definition, ({meanings}) =>
                        _.flatMap(meanings, ({partOfSpeech, definitions}) =>
                            definitions.map(definition => ({partOfSpeech, ...definition})))))
            }
        })
    }

    /* Respond to user updating the starred field */
    useEffect(() => {
        if (defaultQuery !== query) {
            setQuery(defaultQuery)
            if (query && query.length > 0) {
                searchQuery()
            }
        }
    }, [defaultQuery])

    const setSelection = (_selection) => {
        _setSelection(_selection)
        updateSelection(_selection)
    }

    const selectDefinition = (definition) => {
        // setSelection([...selection, definition])
        // setOptions(options.filter(option => option.id !== definition.id))
    }

    const deselectDefinition = (definition) => {
        // setOptions([definition, ...options])
        // setSelection(selection.filter(selection => selection.id !== definition.id))
    }
    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <Divider/>

        <CardContent>
            <TextField
                className={classes.margin}
                id="input-with-icon-textfield"
                variant="outlined"
                margin="dense"
                placeholder="Search definitions"
                value={query}
                onChange={({target: {value}}) => setQuery(value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Subtitles fontSize="small" color="disabled"/>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="small" onClick={searchQuery} className={classes.iconButton}
                                        aria-label="add">
                                <Search fontSize="small"/>
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box mt={4}>
                <Grid container spacing={1}>
                    {
                        options.map((def) => (
                            <Grid item xs={12}>
                                <DefinitionCard definition={def}/>
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
        </CardContent>
    </Collapse>
}

export default DefinitionSelector
