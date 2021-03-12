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
    InputAdornment,
    GridList,
    GridListTile,
    Box
} from "@material-ui/core";
import React, {useState} from "react";
import {Image, Mic, Movie, Search} from "@material-ui/icons";
import useSWR from "swr";
import axios from "axios";

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
}));

const useBool = (defaultValue = false) => {
    const [value, setValue] = useState(defaultValue)
    const toggleValue = () => setValue(!value)
    return [value, toggleValue]
}

const ImageSelector = ({visible, defaultQuery=""}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)

    const imageFetcher = url => axios.post(url, {query})
    const {data, error, ...rest} = useSWR("/api/resources/images", imageFetcher)
    const images = data?.data?.response ?? []
    console.log(rest, data, error)

    return <Collapse in={visible} timeout="auto" unmountOnExit>
        <Divider/>

        <CardContent>
            <TextField
                className={classes.margin}
                id="input-with-icon-textfield"
                variant="outlined"
                margin="dense"
                placeholder="Search images"
                value={query}
                onChange={({target: { value }})=> setQuery(value)}
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
            <Box mt={4}>
            <GridList cellHeight={160} className={classes.gridList} cols={4}>
                {images.map((tile) => (
                    <GridListTile key={tile.img} cols={2.5}>
                        <img src={tile.img} alt={tile.title} />
                    </GridListTile>
                ))}
            </GridList>
            </Box>
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
        <ImageSelector visible={imagesVisible}/>
        <ImageSelector visible={audioVisible}/>
    </Card>
}

export default Field
