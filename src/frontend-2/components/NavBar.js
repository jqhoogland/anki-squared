import React, {useState} from "react"
import {
    AppBar,
    Box,
    Container,
    Divider,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Slide,
    Toolbar,
    useScrollTrigger
} from "@material-ui/core";
import {
    AddCircle,
    ChevronRight as ChevronRightIcon,
    ChevronLeft as ChevronLeftIcon,
    Home,
    List as ListIcon,
    Menu as MenuIcon
} from "@material-ui/icons"
import theme from "../theme";
import Link from "next/link"
import {useDeck} from "./DeckProvider";
import clsx from "clsx";
import Chooser from "./Chooser";
import LanguagePicker from "./LanguagePicker";

const drawerWidth = 240

const useStyles = makeStyles({
    languagePicker: {marginLeft: "auto"},
    menuButton: {
        marginRight: theme.spacing(2)
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    topPadding: {
        marginBottom: theme.spacing(5)
    }
})

const drawerIcons = [
    {value: 'Home', icon: <Home/>, destination: "/"},
    {value: 'Queue', icon: <ListIcon/>, destination: "/queue"},
    {value: 'Add Note', icon: <AddCircle/>, destination: "/add"}
]

const NavDrawer = ({open, onClose}) => {
    const classes = useStyles()

    return <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
            paper: classes.drawerPaper,
        }}
    >
        <div className={classes.drawerHeader}>
            <IconButton onClick={onClose}>
                {theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
            </IconButton>
        </div>
        <Divider/>
        <List>
            {drawerIcons.map(({value, icon, destination}, index) => (
                <Link href={destination} passHref>
                    <ListItem button key={value} component="a">
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={value}/>
                    </ListItem>
                </Link>
            ))}
        </List>
    </Drawer>
}


const NavBar = ({window}) => {
    const classes = useStyles()
    const {deckName, modelName, decks, models, setDeck, setModel} = useDeck()
    const [open, setOpen] = useState()

    const trigger = useScrollTrigger({target: window ? window() : undefined});

    return <div><Slide appear={true} direction="down" in={!trigger}>
        <AppBar color="secondary">
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => setOpen(true)}
                    className={clsx(classes.menuButton, open && classes.hide)}
                >
                    <MenuIcon/>
                </IconButton>
                <Container>
                    <Box my={2}>
                        <Grid container spacing={1}>
                            <Grid item>
                                <Chooser label="Deck" item={deckName} setItem={setDeck} options={decks}
                                         defaultItem={deckName}/>
                            </Grid>
                            <Grid item>
                                <Chooser label="Model" item={modelName} setItem={setModel} options={models}
                                         defaultItem={modelName}/>
                            </Grid>
                            <Grid item className={classes.languagePicker}>
                                <LanguagePicker label="Language"/>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Toolbar>
            <NavDrawer open={open} onClose={() => setOpen(false)}/>
        </AppBar>
    </Slide>
        <Toolbar className={classes.topPadding}/>
    </div>
}

export default NavBar
