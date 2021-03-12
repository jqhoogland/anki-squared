import {
    Card,
    CardActions,
    CardContent,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    makeStyles,
    TextField,
    Typography,
    InputAdornment
} from "@material-ui/core";
import React, {useState} from "react";
import {Image, Mic, Movie, Search} from "@material-ui/icons";

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
        margin: theme.spacing(1),
    },
}));

const useBool = (defaultValue = false) => {
    const [value, setValue] = useState(defaultValue)
    const toggleValue = () => setValue(!value)
    return [value, toggleValue]
}

const ImageSelector = ({visible}) => {
    const classes = useStyles()

    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <CardContent>
            <Divider/>
            <TextField
                className={classes.margin}
                id="input-with-icon-textfield"
                variant="outlined"
                margin="dense"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Image fontSize="small" color="disabled"/>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="start">
                            <Search fontSize="small" color="disabled"/>
                        </InputAdornment>
                    ),
                }}
            />
        </CardContent>
    </Collapse>
}

const Field = ({label, updateField}) => {
    const classes = useStyles()
    const [value, setValue] = useState("")

    const [imagesVisible, toggleImagesVisible] = useBool(false)
    const [audioVisible, toggleAudioVisible] = useBool(false)
    const [videosVisible, toggleVideosVisible] = useBool(false)

    const handleChange = ({target: {value}}) => {
        setValue(value)
        updateField(label, value)
    }

    const addImage = () => {
    }

    return <Card variant="outlined">
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
        <CardActions className={classes.fieldActions}>
            <IconButton size="small" onClick={toggleImagesVisible} className={classes.iconButton} aria-label="add">
                <Image fontSize="small" color={imagesVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleAudioVisible} className={classes.iconButton} aria-label="add">
                <Mic fontSize="small"/>
            </IconButton>
            <IconButton disabled size="small" onClick={toggleVideosVisible} className={classes.iconButton}
                        aria-label="add">
                <Movie fontSize="small" color={audioVisible ? "primary" : "action"}/>
            </IconButton>
        </CardActions>
        <ImageSelector visible={imagesVisible}/>
        <ImageSelector visible={audioVisible}/>
    </Card>
}

export default Field
