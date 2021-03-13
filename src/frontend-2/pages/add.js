import _ from "lodash"
import React, {useEffect, useState} from "react"
import {Box, Button, CircularProgress, Container, Grid, makeStyles,} from "@material-ui/core"
import useSWR from "swr"
import axios from "axios"
import Cookies from "js-cookie"

import LanguagePicker from "../components/LanguagePicker";
import Chooser from "../components/Chooser";
import Field from "../components/Field"
import TagPanel from "../components/TagPanel"
import {getFileNameFromUrl} from "../utils";
import {useDeck} from "../providers/DeckProvider";
import NoteCreator from "../components/NoteCreator";


const onCreate = note => axios.post(`/api/notes/create`, note)

export default function Home() {
    const {modelName} = useDeck()
    const [fields, setFields] = useState(false)

    const {
        data: fieldsResponse,
    } = useSWR(`/api/models/fields/${modelName}`, (url) => window.fetch(url).then(res => res.json()), {
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    })
    const fieldNames = fieldsResponse?.response?.result ?? []

    useEffect(() => {
        if (fieldNames && fieldNames.length > 0) {
            setFields(_.zipObject(fieldNames, fieldNames.map((_, i) => {
                if (i < Object.keys(fields).length) {
                    return Object.values(fields)[i]
                }
                return ""
            })))
        }
    }, [fieldNames])

    if (!fields) return <CircularProgress/>

    return <NoteCreator onCreate={onCreate} defaultFields={fields}/>
}
