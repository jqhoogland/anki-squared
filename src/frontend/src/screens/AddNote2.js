import React, {useState, useEffect} from "react"
import {FormControl, InputLabel, Select, MenuItem} from "@material-ui/core"
import {makeStyles} from "@material-ui/core"
import {getDecks, getModels} from "../services/api"
import useSWR from "swr"

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


const Chooser = ({label, chooseItem, defaultItem, loadOptions}) => {
    const classes = useStyles()
    const [item, setItem] = useState(defaultItem)
    const [options, setOptions] = useState([defaultItem])

    useEffect(() => {
        console.log(label, loadOptions)
        loadOptions().then(({result}) => {
            console.log(label, result)
            if (result && result.length) {
                setItem(result[0])
                setOptions(result)
            }
        })
    }, [])

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
            onChange={({target: {value}})=> _setItem(value)}
        >
            {options.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)}
        </Select>
    </FormControl>
}


export default function AddNote() {
    const [deck, setDeck] = useState("Default")
    const [model, setModel] = useState("Basic")

    return <>
        <Chooser label="Deck" chooseItem={setDeck} defaultItem={deck} loadOptions={getDecks}/>
        <Chooser label="Model" chooseItem={setModel} defaultItem={model} loadOptions={getModels}/>
    </>
}