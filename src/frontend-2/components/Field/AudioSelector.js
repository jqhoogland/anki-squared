import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Collapse,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Mic, RadioButtonChecked, RadioButtonUncheckedOutlined, Search} from "@material-ui/icons";
import {useLanguage} from "../LanguageProvider";

const useStyles = makeStyles(theme => ({
    margin: {
        margin: "auto"
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    audio: {
        width: "100%",
        height: "100%"
    },
    selected: {
        borderWidth: 5
    }
}));

const AudioCard = ({audio, selected, onClick}) => {
    const classes = useStyles()
    return <Card variant="outlined" className={selected && classes.selected}>
        <CardActionArea onClick={onClick}>
            <CardHeader
                avatar={<IconButton>{selected ? <RadioButtonChecked/> : <RadioButtonUncheckedOutlined max={3} disabled/>}</IconButton>}
                title={audio.username}
                action={
                    <audio controls>
                        <source src={audio.pathmp3} type="audio/mp3"/>
                        <source src={audio.pathogg} type="audio/ogg"/>
                    </audio>
                }
            />

        </CardActionArea>
    </Card>
}


const AudioSelector = ({visible, defaultQuery = "", updateSelection}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)
    const [selection, _setSelection] = useState([])
    const [options, setOptions] = useState([])
    const {language} = useLanguage()

    const searchQuery = () => {
        axios.post("/api/resources/audio", {query, language}).then(({data}) => {
            console.log(data)
            const audio = data?.response?.items ?? []
            console.log(audio)
            if (audio && audio?.length > 0) {
                setOptions(audio)
            }
        })
    }

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

    const selectAudio = (audio) => {
        setSelection([...selection, audio])
        setOptions(options.filter(option => option.id !== audio.id))
    }

    const deselectAudio = (audio) => {
        setOptions([audio, ...options])
        setSelection(selection.filter(selection => selection.id !== audio.id))
    }
    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <Divider/>

        <CardContent>
            <TextField
                className={classes.margin}
                id="input-with-icon-textfield"
                variant="outlined"
                margin="dense"
                placeholder="Search audios"
                value={query}
                onChange={({target: {value}}) => setQuery(value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Mic fontSize="small" color="disabled"/>
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
                    {selection.map((tile) => (
                        <Grid item xs={12}>
                            <AudioCard audio={tile} onClick={() => deselectAudio(tile)} selected/>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box mt={4}>
                <Grid container spacing={1}>
                    {
                        options.map((tile) => (
                            <Grid item xs={12}>
                                <AudioCard audio={tile} onClick={() => selectAudio(tile)}/>
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
        </CardContent>
    </Collapse>
}

export default AudioSelector
