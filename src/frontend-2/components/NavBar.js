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
    Home,
    List as ListIcon,
    Menu as MenuIcon
} from "@material-ui/icons"
import theme from "../theme";
import Link from "next/link"
import {useDeck} from "./DeckProvider";
import Chooser from "./Chooser";
import LanguagePicker from "./LanguagePicker";

const drawerWidth = 240

const useStyles = makeStyles({
    languagePicker: {marginLeft: "auto"},
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

const drawerPaths = [
    {value: 'Home', icon: <Home/>, destination: "/"},
    {value: 'Queue', icon: <ListIcon/>, destination: "/queue"},
    {value: 'Add Note', icon: <AddCircle/>, destination: "/add"}
]

function NavDrawer({ options = [] }) {
    const classes = useStyles()
    const [isExpanded, setExpanded] = React.useState(false);

    const toggleDrawer = (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setExpanded(!isExpanded);
    };

    return (
        <div>
            <IconButton
                aria-label="display more actions"
                edge="end"
                color="inherit"
                onClick={toggleDrawer}
            >
                <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={isExpanded} onClose={toggleDrawer}>
                <div
                    className={classes.drawerPaper}
                    role="presentation"
                    onClick={toggleDrawer}
                    onKeyDown={toggleDrawer}
                >
                    <List>
                        {options.map(({ value, icon, destination }) => (
                            <Link href={destination} passHref>
                                <ListItem button key={value} component="a">
                                    {icon && <ListItemIcon>{icon}</ListItemIcon>}
                                    <ListItemText primary={value} />
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                </div>
            </Drawer>
        </div>
    );
}


const NavBar = ({window}) => {
    const classes = useStyles()
    const {deckName, modelName, decks, models, setDeck, setModel} = useDeck()
    const [open, setOpen] = useState(false)

    const trigger = useScrollTrigger({target: window ? window() : undefined});

    const toggleDrawer = event => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpen(!open)
    }

    return <div
        onKeyDown={toggleDrawer}
        onClick={toggleDrawer}
    ><Slide appear={true} direction="down" in={!trigger}>
        <AppBar color="secondary">
            <Toolbar>
                <NavDrawer options={drawerPaths}/>
                <Container>
                    <Box my={2}>
                        <Grid container spacing={1}>
                            <Grid item sm={5} xs={3}>
                                <Chooser label="Deck" item={deckName} setItem={setDeck} options={decks}
                                         defaultItem={deckName}/>
                            </Grid>
                            <Grid item sm={6} xs={4}>
                                <Chooser label="Model" item={modelName} setItem={setModel} options={models}
                                         defaultItem={modelName}/>
                            </Grid>
                            <Grid item sm={1} xs={2} className={classes.languagePicker}>
                                <LanguagePicker label="Language"/>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    </Slide>
        <Toolbar className={classes.topPadding}/>
    </div>
}

export default NavBar
