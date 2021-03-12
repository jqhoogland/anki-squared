import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Collapse,
    Divider,
    GridList,
    GridListTile,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Image as ImageIcon, Search} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
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


const ImageSelector = ({visible, defaultQuery = "", updateSelection}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)
    const [selection, _setSelection] = useState([])
    const [options, setOptions] = useState([])

    const searchQuery = () => {
        axios.post("/api/resources/images", {query}).then(({data, ...rest}) => {
            const images = data?.response ?? []
            if (images && images.length > 0) {
                setOptions(images)
            }
        })
    }

    useEffect(() => {
        if (defaultQuery !== query) {
            setQuery(defaultQuery)
            if (query && query.length > 0) {
                searchQuery()
            }
        }
    }, [defaultQuery])

    const setSelection = (_selection) => {
        _setSelection(_selection)
        updateSelection(_selection)
    }

    const selectImage = (image) => {
        setSelection([...selection, image])
        setOptions(options.filter(option => option.img !== image.img))
    }

    const deselectImage = (image) => {
        setOptions([image, ...options])
        setSelection(selection.filter(selection => selection.img !== image.img))
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
                onChange={({target: {value}}) => setQuery(value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <ImageIcon fontSize="small" color="disabled"/>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="small" onClick={searchQuery} className={classes.iconButton}
                                        aria-label="add">
                                <Search fontSize="small"/>
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box mt={4}>
                <GridList cellHeight={60} cols={8}>
                    {selection.map((tile) => (
                        <GridListTile key={tile.img} cols={1}>
                            <Card>
                                <CardActionArea onClick={() => deselectImage(tile)}>
                                    <CardMedia>
                                        <img src={tile.thumbnail} alt={tile.title} className={classes.image}/>
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
                                        <img src={tile.thumbnail} alt={tile.title} className={classes.image}/>
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

export default ImageSelector
