import {CardContent, Collapse, Divider, FormControl, makeStyles, TextField} from "@material-ui/core";
import React, {useState} from "react";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
    textField: {
        width: "100%",
    },
}));


const TextSelector = ({visible, label, defaultValue = "", updateText}) => {
    const classes = useStyles()
    const [value, setValue] = useState(defaultValue)

    const handleChange = ({target: {value}}) => {
        setValue(value)
        updateText(value)
    }

    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <Divider/>
        <CardContent>
            <FormControl className={classes.formControl}>
                <TextField
                    className={classes.textField}
                    label={label}
                    multiline
                    value={value}
                    onChange={handleChange}
                    margin="dense"
                />
            </FormControl>
        </CardContent>
    </Collapse>
}

export default TextSelector
