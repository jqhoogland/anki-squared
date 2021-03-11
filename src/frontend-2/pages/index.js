import React, {useState, useEffect} from "react"
import Head from 'next/head'
import {FormControl, InputLabel, Select, MenuItem, Container, TextField, Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/core"
import useSWR from "swr"

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

    useEffect(() => {
        setItem(options[0])
    }, [options])

    const _setItem = (item) => {
        setItem(item)
        chooseItem(item)
    }

    return <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={item}
            onChange={({target: {value}}) => _setItem(value)}
        >
            {options && options.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)}
        </Select>
    </FormControl>
}

const Field = ({label}) => {
    const classes = useStyles()
    const [value, setValue] = useState("")

    return <FormControl className={classes.formControl}>
        <TextField
            className={classes.textField}
            label={label}
            multiline
            value={value}
            onChange={({target: {value}}) => setValue(value)}
            margin="normal" variant="outlined"/>

    </FormControl>
}


export default function Home() {
    const [deck, setDeck] = useState("Default")
    const [model, setModel] = useState("Basic")

    const {data: fieldsResponse, error} = useSWR(`/api/models/fields/${model}`)
    const fields = fieldsResponse?.response?.result ?? []

    return (
        <Container maxWidth="md">
            <Grid container spacing={1}>
                <Grid item sm={6}>
                    <Chooser label="Deck" chooseItem={setDeck} defaultItem={deck} path="/api/decks"/>
                </Grid>
                <Grid item sm={6}>
                    <Chooser label="Model" chooseItem={setModel} defaultItem={model} path="/api/models"/>
                </Grid></Grid>
            <Grid container spacing={1}>
                {fields.map(field => <Grid item sm={6}><Field label={field}/></Grid>)}
            </Grid>
        </Container>
    )
}
