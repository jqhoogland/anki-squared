import {FormControl, InputLabel, LinearProgress, makeStyles, MenuItem, Select} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import useSWR from "swr";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
}));

const Chooser = ({label, item, setItem, defaultItem, options}) => {
    const classes = useStyles()

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
