import {Card, CardContent, Chip, Grid, IconButton, InputBase, makeStyles, Paper} from "@material-ui/core";
import React, {useState} from "react";
import AddIcon from "@material-ui/icons/AddCircle";

const useStyles = makeStyles(theme => ({
    tagCard: {
        marginTop: theme.spacing(8)
    },
    input: {
        flex: 1,
        paddingLeft: theme.spacing(1),
    },
    iconButton: {
        padding: 10,
        marginRight: 0
    },
    tagInput: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
    },
}));


const TagPanel = ({defaultTags, updateTags}) => {
    const classes = useStyles()
    const [tags, _setTags] = useState(defaultTags)
    const [value, setValue] = useState("")

    const setTags = _tags => {
        _setTags(_tags)
        updateTags(tags)
    }
    const removeTag = (tag) => setTags(tags.filter(_tag => _tag !== tag))
    const addTag = () => {
        setTags([...tags, value])
        setValue("")
    }

    return <Card className={classes.tagCard} variant="outlined">
        <CardContent>
            <Grid container spacing={1}>
                {tags.map((tag, i) => <Grid item><Chip
                    className={classes.tag}
                    key={`key${i}`}
                    variant="outlined"
                    size="small"
                    label={tag}
                    onDelete={() => removeTag(tag)}
                /></Grid>)}
            </Grid>
        </CardContent>
        <CardContent>
            <Paper component="form" className={classes.tagInput} variant="outlined">
                <InputBase
                    className={classes.input}
                    placeholder="Add Tags"
                    value={value}
                    inputProps={{ 'aria-label': 'add tags' }}
                    onChange={({target: {value}}) => setValue(value)}
                />
                <IconButton onClick={addTag} className={classes.iconButton} aria-label="add">
                    <AddIcon />
                </IconButton>
            </Paper>
        </CardContent>

    </Card>
}

export default TagPanel
