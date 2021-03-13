import _ from "lodash"
import React, {useEffect, useState} from "react"
import {Box, Button, CircularProgress, Container, Grid, makeStyles,} from "@material-ui/core"
import useSWR from "swr"
import axios from "axios"
import Cookies from "js-cookie"

import LanguagePicker from "../components/LanguagePicker";
import Chooser from "../components/Chooser";
import Field from "../components/Field"
import TagPanel from "../components/TagPanel"
import {getFileNameFromUrl} from "../utils";


const createCardOptions = {
    "allowDuplicate": false,
}

const useStyles = makeStyles({
    languagePicker: {marginLeft: "auto"}
})

const saveFieldTypes = ({modelName, fields, audio, video, picture}) => {
    const fieldTypes = _.mapValues(fields, text => text.length > 0 ? ["text"] : [])

    audio.forEach(({fields}) => fieldTypes[fields[0]] = [...fieldTypes[fields[0]], "audio"])
    video.forEach(({fields}) => fieldTypes[fields[0]] = [...fieldTypes[fields[0]], "video"])
    picture.forEach(({fields}) => fieldTypes[fields[0]] = [...fieldTypes[fields[0]], "picture"])

    Cookies.set(modelName, _.mapValues(fieldTypes, _.uniq))
}

const makeMedia = (fieldName, {url, filename}) => ({
    url,
    filename,
    fields: [fieldName]
})

const useMedia = (defaultValue = []) => {
    const [media, setMedia] = useState(defaultValue)

    const updateMedia = (fieldName, selection = []) => {
        setMedia([
            ...media.filter((media) => !media.fields.find(field => field === fieldName)),
            ...selection.map(media => makeMedia(fieldName, media))
        ])
    }
    return [media, updateMedia]
}


export default function Home() {
    const classes = useStyles()
    const [deckName, setDeck] = useState("Default")
    const [modelName, setModel] = useState("Basic")
    const [fields, setFields] = useState({})
    const [tags, setTags] = useState([])
    const [picture, _updatePicture] = useMedia([])
    const [audio, _updateAudio] = useMedia([])
    const [starredField, setStarredField] = useState("Basic")
    const [fieldTypes, setFieldTypes] = useState({})
    const [defaultQuery, setDefaultQuery] = useState("")
    const updateDefaultQuery = () => setDefaultQuery(fields[starredField])
    const [focus, setFocus] = useState(fields[starredField])
    const [isRefreshing, setRefreshing] = useState(false)

    const {
        data: fieldsResponse,
        error
    } = useSWR(`/api/models/fields/${modelName}`, (url) => window.fetch(url).then(res => res.json()), {
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })
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
            setStarredField(fieldNames[0])
            try {
                setFieldTypes(JSON.parse(Cookies.get(modelName)))
            } catch (e) {
                setFieldTypes({})
            }
        }
    }, [fieldNames])

    useEffect(() => {
        if (isRefreshing) {
            setTimeout(() => {
                setRefreshing(false)
            }, 50)
        }
    }, [isRefreshing])

    const video = []

    const clearNote = () => {
        setRefreshing(true)
        setFields(_.mapValues(fields, () => ""))
        _updatePicture([])
        _updateAudio([])
    }

    const handleCreate = () => {
        saveFieldTypes({modelName, fields, audio, video, picture})
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
        clearNote()
    }

    const updateText = (fieldName, value) => {
        setFields({...fields, [fieldName]: value})
    }

    const updatePicture = (fieldName, selection) => _updatePicture(
        fieldName,
        selection.map(({thumbnail, filename}) => ({
            url: thumbnail,
            filename
        }))
    )

    const updateAudio = (fieldName, selection) => _updateAudio(
        fieldName,
        selection.map(({pathmp3}) => ({url: pathmp3, filename: getFileNameFromUrl(pathmp3) + ".mp3"}))
    )

    const handleReturn = (fieldName) => {
        if (fieldName === starredField) {
            updateDefaultQuery()
        }
        const nextIndex = Math.min(fieldNames.indexOf(fieldName) + 1, fieldNames.length)
        setFocus(fieldNames[nextIndex])

    }


    return (
        <Container maxWidth="md">
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
            <Box mt={2}>
                {isRefreshing ? (
                    <CircularProgress/>
                ) : (
                    <Grid container spacing={2}>
                        {!fieldNames.length && <Grid item sm={12}><CircularProgress/></Grid>}
                        {fieldNames.map(fieldName => (
                            <Grid item md={6} xs={12}>
                                <Field
                                    label={fieldName}
                                    isStarred={fieldName === starredField}
                                    onStar={() => setStarredField(fieldName)}
                                    handleReturn={() => handleReturn(fieldName)}
                                    updateText={(text) => updateText(fieldName, text)}
                                    updateImages={(selection) => updatePicture(fieldName, selection)}
                                    updateAudio={(selection) => updateAudio(fieldName, selection)}
                                    defaultQuery={defaultQuery}
                                    fieldType={fieldTypes[fieldName]}
                                    isFocused={fieldName === focus}
                                />
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
                )}
            </Box>
        </Container>
    )
}
