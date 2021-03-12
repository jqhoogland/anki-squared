import {FormControl, makeStyles, TextField} from "@material-ui/core";
import React, {useState} from "react";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
    textField: {
        width: "100%"
    },
}));


const Field = ({label, updateField}) => {
    const classes = useStyles()
    const [value, setValue] = useState("")

    const handleChange = ({target: {value}}) => {
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

export default Field
