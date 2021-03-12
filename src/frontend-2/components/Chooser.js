import {FormControl, InputLabel, LinearProgress, makeStyles, MenuItem, Select} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import useSWR from "swr";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
}));

const Chooser = ({label, chooseItem, defaultItem, path}) => {
    const classes = useStyles()
    const [item, _setItem] = useState(defaultItem)

    const {data, error} = useSWR(path, (url) => window.fetch(url).then(res => res.json()), {revalidateOnReconnect: false, revalidateOnFocus: false})
    const options = data?.response ?? []

    const setItem = (item) => {
        _setItem(item)
        chooseItem(item)
    }

    useEffect(() => {
        if (options && options.length > 0) {
            setItem(options[0])
        }
    }, [options])


    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={item}
                onChange={({target: {value}}) => setItem(value)}
            >
                {options ? options.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)
                    : <MenuItem value={item}>{item}</MenuItem>}

            </Select>
            {!item && <LinearProgress/>}
        </FormControl>
    )
}

export default Chooser
