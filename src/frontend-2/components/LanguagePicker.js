import {FormControl, InputLabel, LinearProgress, makeStyles, MenuItem, Select} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {useLanguage} from "./LanguageProvider";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
}));

const LanguagePicker = ({label }) => {
    const classes = useStyles()
    const {language, languages, setLanguage} = useLanguage()

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={language}
                onChange={({target: {value}}) => setLanguage(value)}
            >
                {
                    languages.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)
                }

            </Select>
        </FormControl>
    )
}

export default LanguagePicker
