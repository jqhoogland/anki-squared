import React, {useEffect, useState} from "react"
import {useDeck} from "../providers/DeckProvider";
import useSWR from "swr";
import _ from "lodash";
import Cookies from "js-cookie";
import {getFileNameFromUrl} from "../utils";
import {Box, Button, CircularProgress, Container, Grid} from "@material-ui/core";
import Field from "./Field";
import TagPanel from "./TagPanel";

const createCardOptions = {
    "allowDuplicate": true,
}


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

const NoteCreator = ({onCreate, defaultFields={}, defaultTags=[]}) => {
    console.log("DEFAULTS", defaultFields, defaultTags)

    const {deckName, modelName} = useDeck()
    const [fields, setFields] = useState(defaultFields)
    const fieldNames = Object.keys(fields)
    const [tags, setTags] = useState(defaultTags)

    const [picture, _updatePicture] = useMedia([])
    const [audio, _updateAudio] = useMedia([])
    const video = []

    const [starredField, setStarredField] = useState("Basic")
    const [fieldTypes, setFieldTypes] = useState({})
    const [defaultQuery, setDefaultQuery] = useState("")
    const updateDefaultQuery = () => setDefaultQuery(fields[starredField])
    const [focus, setFocus] = useState(fields[starredField])
    const [isRefreshing, setRefreshing] = useState(false)

    console.log("Given", fields, tags)

    useEffect(() => {
        if (defaultFields && defaultFields.length > 0) {
            setFields(defaultFields)
            setStarredField(Object.keys(defaultFields)[0])
            try {
                setFieldTypes(JSON.parse(Cookies.get(modelName)))
            } catch (e) {
                setFieldTypes({})
            }
        }
    }, [defaultFields])

    useEffect(() => {
        if (isRefreshing) {
            setTimeout(() => {
                setRefreshing(false)
            }, 50)
        }
    }, [isRefreshing])

    const clearNote = () => {
        setRefreshing(true)
        setFields(_.mapValues(fields, () => ""))
        _updatePicture([])
        _updateAudio([])
    }

    const handleCreate = (queue=false) => {
        saveFieldTypes({modelName, fields, audio, video, picture})
        onCreate({
            deckName,
            modelName,
            fields,
            options: createCardOptions,
            tags,
            audio,
            video,
            picture,
            queue
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
                                    defaultValue={defaultFields[fieldName]}
                                />
                            </Grid>)
                        )}
                        <Grid item xs={12}>
                            <Box my={5}>
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Button color="primary" variant="contained" onClick={() => handleCreate(true)}>Add to Queue</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button color="primary" variant="contained" onClick={() => handleCreate(false)}>Create</Button>
                                    </Grid>
                                </Grid>
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

export default NoteCreator
