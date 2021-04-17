import {Card, CardActions, IconButton, makeStyles} from "@material-ui/core";
import React from "react";
import {Image, Mic, Movie, Star, StarOutline, Subtitles, TextFields} from "@material-ui/icons";

import TextSelector from "./TextSelector"
import ImageSelector from "./ImageSelector";
import AudioSelector from "./AudioSelector";
import DefinitionSelector from "./DefinitionSelector";
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


const Field = ({
                   label,
                   isStarred,
                   onStar,
                   fieldType,
                   defaultQuery,
                   handleReturn,
                   updateImages,
                   updateAudio,
                   updateText,
                   updateDefinition,
                   updateVideo,
                   isFocused,
                   defaultValue
               }) => {
    const classes = useStyles()

    const [textVisible, toggleTextVisible] = useBool(!fieldType || (fieldType.indexOf("text") >= 0))
    const [definitionVisible, toggleDefinitionVisible] = useBool(fieldType && (fieldType.indexOf("definition") >= 0))
    const [imagesVisible, toggleImagesVisible] = useBool(fieldType && (fieldType.indexOf("picture") >= 0))
    const [audioVisible, toggleAudioVisible] = useBool(fieldType && (fieldType.indexOf("audio") >= 0))
    const [videosVisible, toggleVideosVisible] = useBool(fieldType && (fieldType.indexOf("video") >= 0))

    return <Card variant="outlined">
        <CardActions className={classes.fieldActions}>
            <IconButton size="small" onClick={onStar} className={classes.leftButton} aria-label="star">
                {isStarred ? <Star fontSize="small" color="primary"/> : <StarOutline fontSize="small" color="action"/>}
            </IconButton>
            <IconButton size="small" onClick={toggleTextVisible} className={classes.rightButton}
                        aria-label="toggle text">
                <TextFields fontSize="small" color={textVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleDefinitionVisible} className={classes.rightButton}
                        aria-label="toggle definition">
                <Subtitles fontSize="small" color={definitionVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleImagesVisible} className={classes.rightButton}
                        aria-label="toggle image">
                <Image fontSize="small" color={imagesVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton size="small" onClick={toggleAudioVisible} className={classes.rightButton}
                        aria-label="toggle audio">
                <Mic fontSize="small" color={audioVisible ? "primary" : "action"}/>
            </IconButton>
            <IconButton disabled size="small" onClick={toggleVideosVisible} className={classes.rightButton}
                        aria-label="add">
                <Movie fontSize="small"/>
            </IconButton>
        </CardActions>
        <TextSelector
            label={label}
            visible={textVisible}
            defaultQuery={defaultQuery}
            defaultValue={defaultValue}
            updateText={updateText}
            handleReturn={handleReturn}
            isFocused={isFocused}
            autoFocus={isStarred}
        />
        <DefinitionSelector visible={definitionVisible} defaultQuery={defaultQuery} updateSelection={updateDefinition}/>
        <ImageSelector visible={imagesVisible} defaultQuery={defaultQuery} updateSelection={updateImages}/>
        <AudioSelector visible={audioVisible} defaultQuery={defaultQuery} updateSelection={updateAudio}/>
    </Card>
}

export default Field
