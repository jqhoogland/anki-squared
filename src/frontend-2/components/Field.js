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
    Box,
    CardActionArea,
    CardMedia
} from "@material-ui/core";
import React, {useState, useEffect} from "react";
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
    image: {
        width: "100%",
        height: "100%"
    }
}));

const useBool = (defaultValue = false) => {
    const [value, setValue] = useState(defaultValue)
    const toggleValue = () => setValue(!value)
    return [value, toggleValue]
}

const ImageSelector = ({visible, defaultQuery=""}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)
    const [selection, setSelection] =useState([])
    const [options, setOptions] = useState([])

    const imageFetcher = url => axios.post(url, {query})
    const {data, error} = useSWR("/api/resources/images", imageFetcher)
    const images = data?.data?.response ?? []

    useEffect(() => {
        if (images && images.length > 0) {
            setOptions(images)
        }
    }, [])

    const selectImage = (image) => {
        setSelection([...selection, image])
        setOptions(options.filter(option => option.img !== image.img))
    }

    const deselectImage = (image) => {
        setOptions([image, ...options])
        setSelections(selections.filter(selection => selection.img !== image.img))
    }

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
                <GridList cellHeight={50}  cols={10}>
                    {selection.map((tile) => (
                        <GridListTile key={tile.img} cols={1}>
                            <Card>
                                <CardActionArea onClick={() => deselectImage(tile)}>
                                    <CardMedia>
                                        <img src={tile.img} alt={tile.title} className={classes.image}/>
                                    </CardMedia>
                                </CardActionArea>
                            </Card>
                        </GridListTile>
                    ))}
                </GridList>
            </Box>
            <Box mt={4}>
            <GridList cellHeight={160} className={classes.gridList} cols={2.5}>
                {options.map((tile) => (
                    <GridListTile key={tile.img} cols={1}>
                        <Card>
                            <CardActionArea onClick={() => selectImage(tile)}>
                                <CardMedia>
                                    <img src={tile.img} alt={tile.title} className={classes.image}/>
                                </CardMedia>
                            </CardActionArea>
                        </Card>
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
