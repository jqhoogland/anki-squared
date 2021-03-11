import React, { useState, useEffect} from "react"
import Head from 'next/head'
import {FormControl, InputLabel, Select, MenuItem, Container} from "@material-ui/core"
import {makeStyles} from "@material-ui/core"
import useSWR from "swr"

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));



const Chooser = ({label, chooseItem, defaultItem, path}) => {
  const classes = useStyles()
  const [item, setItem] = useState(defaultItem)

  const {data: {response: options}, error} = useSWR(path)

  useEffect(() => {setItem(options[0])}, [options])

  const _setItem = (item) => {
    setItem(item)
    chooseItem(item)
  }

  return <FormControl className={classes.formControl}>
    <InputLabel id="demo-simple-select-label">{label}</InputLabel>
    <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={item}
        onChange={({target: {value}})=> _setItem(value)}
    >
      {options && options.map((option, i) => <MenuItem key={`key${i}`} value={option}>{option}</MenuItem>)}
    </Select>
  </FormControl>
}


export default function Home() {
  const [deck, setDeck] = useState("Default")
  const [model, setModel] = useState("Basic")

  return (
    <Container maxWidth="md">
        <Chooser label="Deck" chooseItem={setDeck} defaultItem={deck} path="/api/decks"/>
        <Chooser label="Model" chooseItem={setModel} defaultItem={model} path="/api/models"/>

    </Container>
  )
}
