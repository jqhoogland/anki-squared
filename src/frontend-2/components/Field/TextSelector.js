import {CardContent, Collapse, Divider, FormControl, makeStyles, TextField} from "@material-ui/core";
import React, {useEffect, useRef, useState} from "react";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
    textField: {
        width: "100%",
    },
}));


const TextSelector = ({visible, label, defaultValue = "", updateText, handleReturn, isFocused}) => {
    const classes = useStyles()
    const [value, setValue] = useState(defaultValue)
    const inputRef = useRef()

    const handleChange = ({target }) => {
        setValue(target.value)
        updateText(target.value)
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            handleReturn()
            event.preventDefault()
        }
    }

    useEffect(() => {
        if (isFocused) {
            inputRef.current.focus()
        }
    }, [isFocused])

    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <Divider/>
        <CardContent>
            <FormControl className={classes.formControl}>
                <TextField
                    className={classes.textField}
                    inputRef={inputRef}
                    label={label}
                    multiline
                    value={value}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    margin="dense"
                />
            </FormControl>
        </CardContent>
    </Collapse>
}

export default TextSelector
