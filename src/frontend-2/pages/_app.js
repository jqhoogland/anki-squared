import '../styles/globals.css'
import React from "react";
import Head from "next/head";
import Container from "@material-ui/core/Container"
import theme from "../theme";
import {ThemeProvider} from "@material-ui/core"
import LanguageProvider from "../providers/LanguageProvider";
import DeckProvider from "../providers/DeckProvider";
import NavBar from "../components/NavBar";
import QueueProvider from "../providers/QueueProvider";

function MyApp({Component, pageProps}) {
    React.useEffect(() => {
        // Remove the server-side injected CSS.
        // eslint-disable-next-line no-undef
        const jssStyles = document.querySelector("#jss-server-side");
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    const title = `Health Curious | ${pageProps?.title}`;

    return (
        <>
            <Head>
                <title>Anki Squared</title>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                <link rel="manifest" href="/site.webmanifest"/>
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
                <meta name="theme-color" content="#ffffff"/>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <ThemeProvider theme={theme}>
                <DeckProvider>
                    <QueueProvider>
                        <LanguageProvider>
                            <main>
                                <NavBar/>
                                <Component {...pageProps} />
                            </main>
                        </LanguageProvider>
                    </QueueProvider>
                </DeckProvider>
            </ThemeProvider>
            <footer>
                <Container>
                    <a
                        href="https://github.com/jqhoogland"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {/* Author: Jesse Hoogland */}
                    </a>
                </Container>
            </footer>
        </>)
}

export default MyApp
