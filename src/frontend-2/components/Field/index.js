import {Card, CardActions, IconButton, makeStyles} from "@material-ui/core";
import React from "react";
import {Image, Mic, Movie, Star, StarOutline, TextFields} from "@material-ui/icons";

import TextSelector from "./TextSelector"
import ImageSelector from "./ImageSelector";
import AudioSelector from "./AudioSelector";
import {useBool} from "../../utils";

const useStyles = makeStyles(theme => ({
    formControl: {
        width: "100%"
    },
    textField: {
        width: "100%",
    },
    rightButton: {
        marginLeft: "auto"
    },
    leftButton: {
        marginRight: "auto"
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


const Field = ({label, isStarred, onStar, defaultQuery, updateImages, updateAudio, updateText, updateVideo}) => {
    const classes = useStyles()

    const [textVisible, toggleTextVisible] = useBool(true)
    const [imagesVisible, toggleImagesVisible] = useBool(false)
    const [audioVisible, toggleAudioVisible] = useBool(false)
    const [videosVisible, toggleVideosVisible] = useBool(false)

    return <Card variant="outlined">
        <CardActions className={classes.fieldActions}>
            <IconButton size="small" onClick={onStar} className={classes.leftButton} aria-label="star">
                {isStarred ? <Star fontSize="small" color="primary"/> : <StarOutline fontSize="small" color="action"/> }
            </IconButton>
            <IconButton size="small" onClick={toggleTextVisible} className={classes.rightButton} aria-label="add">
                <TextFields fontSize="small" color={textVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleImagesVisible} className={classes.rightButton} aria-label="add">
                <Image fontSize="small" color={imagesVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleAudioVisible} className={classes.rightButton} aria-label="add">
                <Mic fontSize="small" color={audioVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton disabled size="small" onClick={toggleVideosVisible} className={classes.rightButton}
                        aria-label="add">
                <Movie fontSize="small"/>
            </IconButton>
        </CardActions>
        <TextSelector label={label} visible={textVisible} defaultQuery={defaultQuery} updateText={updateText}/>
        <ImageSelector visible={imagesVisible} defaultQuery={defaultQuery} updateSelection={updateImages}/>
        <AudioSelector visible={audioVisible} defaultQuery={defaultQuery} updateSelection={updateAudio}/>
    </Card>
}

export default Field
