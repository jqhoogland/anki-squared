import {
    Card,
    CardActions,
    CardContent,
    FormControl,
    IconButton,
    makeStyles,
    TextField,
} from "@material-ui/core";
import React, {useState} from "react";
import {Image, Mic, Movie} from "@material-ui/icons";

import ImageSelector from "./ImageSelector";
import {useBool} from "../utils";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
    textField: {
        width: "100%",
    },
    iconButton: {
        marginLeft: "auto"
    },
    fieldActions: {
        paddingRight: theme.spacing(2)
    },
    margin: {
        margin: "auto"
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    image: {
        width: "100%",
        height: "100%"
    }
}));

const Field = ({label, updateField, updateImages, updateAudio, updateVideo}) => {
    const classes = useStyles()
    const [value, setValue] = useState("")

    const [imagesVisible, toggleImagesVisible] = useBool(false)
    const [audioVisible, toggleAudioVisible] = useBool(false)
    const [videosVisible, toggleVideosVisible] = useBool(false)

    const handleChange = ({target: {value}}) => {
        setValue(value)
        updateField(label, value)
    }

    return <Card variant="outlined">
        <CardActions className={classes.fieldActions}>
            <IconButton size="small" onClick={toggleImagesVisible} className={classes.iconButton} aria-label="add">
                <Image fontSize="small" color={imagesVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleAudioVisible} className={classes.iconButton} aria-label="add">
                <Mic fontSize="small" color={audioVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton disabled size="small" onClick={toggleVideosVisible} className={classes.iconButton}
                        aria-label="add">
                <Movie fontSize="small" />
            </IconButton>
        </CardActions>
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
        <ImageSelector visible={imagesVisible} defaultQuery={""} updateSelection={updateImages}/>
        <ImageSelector visible={audioVisible} defaultQuery={""} updateSelection={updateAudio}/>
    </Card>
}

export default Field
