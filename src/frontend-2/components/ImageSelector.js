import {
    Box, Card, CardActionArea, CardActions,
    CardContent, CardMedia,
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
import useSWR from "swr";
import {Image, Search} from "@material-ui/icons";

import { useBool} from "../utils";

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


const ImageSelector = ({visible, defaultQuery="", updateSelection}) => {
    const classes = useStyles()
    const [query, setQuery] = useState(defaultQuery)
    const [selection, _setSelection] =useState([])
    const [options, setOptions] = useState([])

    const imageFetcher = url => axios.post(url, {query})
    const {data, error} = useSWR("/api/resources/images", imageFetcher)
    const images = data?.data?.response ?? []

    useEffect(() => {
        if (images && images.length > 0) {
            setOptions(images)
        }
    }, [])

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

    const searchQuery = () => {
        imageFetcher("/api/resources/images").then(({data, ...rest}) => {
            const _images = data?.response ?? []
            if (_images && images.length > 0) {
                setOptions(_images)
            }
        })
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
                            <IconButton size="small" onClick={searchQuery} className={classes.iconButton} aria-label="add">
                                <Search fontSize="small"/>
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box mt={4}>
                <GridList cellHeight={60}  cols={8}>
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

export default ImageSelector
