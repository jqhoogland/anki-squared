import _ from "lodash"
import React, {useEffect, useState} from "react"
import {
    Button,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    makeStyles,
    MenuItem,
    Select,
    TextField
} from "@material-ui/core"
import useSWR from "swr"
import axios from "axios"

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        width: "100%"
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


const Chooser = ({label, chooseItem, defaultItem, path}) => {
    const classes = useStyles()
    const [item, setItem] = useState(defaultItem)

    const {data, error} = useSWR(path)
    const options = data?.response ?? []

    const _setItem = (item) => {
        setItem(item)
        chooseItem(item)
    }

    useEffect(() => {
        if (options && options.length > 0) {
            _setItem(options[0])
        }
    }, [options])


    return <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={item}
            onChange={({target: {value}}) => _setItem(value)}
        >
            {options ? options.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)
            : <MenuItem value={item}>{item}</MenuItem>}

        </Select>
        {!item && <LinearProgress/>}
    </FormControl>
}

const Field = ({label, updateField}) => {
    const classes = useStyles()
    const [value, setValue] = useState("")

    const handleChange = ({target: { value }}) => {
        setValue(value)
        updateField(label, value)
    }

    return <FormControl className={classes.formControl}>
        <TextField
            className={classes.textField}
            label={label}
            multiline
            value={value}
            onChange={handleChange}
            margin="normal" variant="outlined"/>

    </FormControl>
}

const createCardOptions = {
    "allowDuplicate": false,
}

export default function Home() {
    const [deckName, setDeck] = useState("Default")
    const [modelName, setModel] = useState("Basic")
    const [fields, setFields] = useState({})

    const {data: fieldsResponse, error} = useSWR(`/api/models/fields/${modelName}`)
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
        }
    }, [fieldNames])

    const tags = []
    const audio = []
    const picture = []
    const video = []

    const handleCreate = () => {
        axios.post(`/api/notes/create`, {deckName, modelName, fields, options: createCardOptions, tags, audio, video, picture})
    }

    const handleChangeField = (fieldName, value) => {
        setFields({...fields, [fieldName]: value})
    }

    return (
        <Container maxWidth="md">
            <Grid container spacing={1}>
                <Grid item>
                    <Chooser label="Deck" chooseItem={setDeck} defaultItem={deckName} path="/api/decks"/>
                </Grid>
                <Grid item>
                    <Chooser label="Model" chooseItem={setModel} defaultItem={modelName} path="/api/models"/>
                </Grid></Grid>
            <Grid container spacing={1}>
                {!fieldNames.length && <Grid item sm={12}><CircularProgress/></Grid>}
                {fieldNames.map(fieldName => <Grid item sm={6}><Field label={fieldName} updateField={handleChangeField}/></Grid>)}
            </Grid>
            <Grid container spacing={1}>
                <Grid item>
                <Button variant="contained" onClick={handleCreate}>Create</Button>
                </Grid>
            </Grid>
        </Container>
    )
}
