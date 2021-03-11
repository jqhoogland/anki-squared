import React, { useState, useEffect } from "react"

import { useParams } from "react-router-dom"

import {
  Alert,
  Row,
  Col,
  Button,
  Container,
  CardDeck,
  CardColumns,
  Card,
  CardBody,
  CardText,
  CardImg,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap"

import { FaPlay, FaStop } from "react-icons/fa"

import { getImages, editNote, getNote } from "../services/api"

const ClickToEdit = (props) => {
  const [edit, setEdit] = useState(false)
  const [value, setValue] = useState(props.value)
  let res

  if (props.value !== value) {
    setValue(props.value)
    setEdit(false)
  }

  const changeHandler = (e) => {
    setValue(e.target.value)
    props.setValue(e.target.value)
  }

  if (edit) {
    res = (
      <Input type="textarea" defaultValue={value} onChange={changeHandler} />
    )
  } else {
    res = <h1 onClick={() => setEdit(true)}>{value}</h1>
  }

  return res
}

const Pronunciation = (props) => {
  const chosen = props.isSelected === props.value

  let audioProps = props.isSelected ? { autoplay: true } : {}
  return (
    <Card
      onClick={props.onClick}
      className="p-1"
      color={chosen ? "dark" : "light"}
      style={{ maxWidth: "30rem", minWidth: "20rem", borderWidth: "3px" }}
    >
      <Row>
        <Col className="col">
          <audio src={props.item.pathmp3} controls {...audioProps} />
        </Col>
        <Col>
          <p>
            {props.item.username} ({props.item.sex})
          </p>
        </Col>
      </Row>
    </Card>
  )
}

const ImgChoice = (props) => {
  const chosen = props.isSelected === props.value

  return (
    <Card
      onClick={props.onClick}
      className="p-1"
      color={chosen ? "dark" : "light"}
      style={{ maxWidth: "18rem" }}
    >
      <CardImg src={props.item.image} alt={props.item.title} />
    </Card>
  )
}

export default function AddNote() {
  const [note, setNoteLocal] = useState({
    word: "",
    definition: "",
    images: [],
    pronunciations: [],
    is_include_recognition: false,
    is_marked: false,
    word_type: "none",
    is_graduated: false,
  })
  const [alert, setAlert] = useState("")

  const setWord = (word) => setNote({ ...note, word })
  const toggleIsIncludeRecognition = () =>
    setNote({ ...note, is_include_recognition: !note.is_include_recognition })
  const toggleIsMarked = () => setNote({ ...note, is_marked: !note.is_marked })
  const setWordType = (wordType) => setNote({ ...note, word_type: wordType })

  let { noteIdx } = useParams()

  useEffect(() => {
    getNote(noteIdx).then(setNoteLocal)

    console.log(note)
  }, [])

  const setNote = (note) => {
    setNoteLocal(note)
    editNote(noteIdx, note)
    console.log(note)
  }

  const clickHandler = () => {
    console.log("NEXT")
  }

  const createNote = () => {
    
  }

  return (
    <div>
      <Container className="App pb-5">
        {alert ? (
          <Alert color="danger" toggle={() => setAlert("")}>
            {alert}
          </Alert>
        ) : (
          ""
        )}

        <h4>Word</h4>
        <Input
          type="textarea"
          defaultValue={note.word}
          onChange={(e) => setWord(e.target.value)}
        />
        <h4 className="pt-3">Definition</h4>
        <Input
          type="textarea"
          rows={5}
          defaultValue={note.definition}
          onChange={(e) => e.preventDefault()}
        />

        <h4 className="pt-3">Image</h4>
        <h4 className="pt-3">Pronunciation</h4>
        <CardDeck className="my-3">{note.pronunciations}</CardDeck>
        <h4 className="pt-3">Word Type</h4>
        <Container>
          <Form>
            <FormGroup tag="fieldset">
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    name="radio1"
                    defaultChecked={note.word_type === "none"}
                    onClick={() => setWordType("none")}
                  />
                  Nessuna
                </Label>
              </FormGroup>
              <Label check>
                <Input
                  type="radio"
                  name="radio1"
                  defaultChecked={note.word_type === "noun"}
                  onClick={() => setWordType("noun")}
                />
                Sostantivo
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="radio1"
                  defaultChecked={note.word_type === "adjective"}
                  onClick={() => setWordType("adjective")}
                />
                Aggettivo
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="radio1"
                  defaultChecked={note.word_type === "verb"}
                  onClick={() => setWordType("verb")}
                />
                Verbo
              </Label>
            </FormGroup>
          </Form>
        </Container>
        <hr />
        <Row className="pt-5">
          <Col className="col-md-4">
            <h4>Include Recognition?</h4>
          </Col>
          <Col>
            <Input
              type="checkbox"
              onClick={toggleIsIncludeRecognition}
              checked={note.is_include_recognition === true}
              style={{ width: "30px", height: "30px" }}
            />
          </Col>
        </Row>
        <hr className="mt-5" />
        <Row className="pt-3 pb-5">
          <Col className="col-md-4">
            <h4>Mark</h4>
          </Col>
          <Col>
            <Input
              type="checkbox"
              onClick={toggleIsMarked}
              checked={note.is_marked === true}
              style={{ width: "30px", height: "30px" }}
            />
          </Col>
        </Row>
      </Container>
      <Container
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
        }}
        className="p-2"
      >
        <Button style={{ float: "right" }} onClick={createNote}>
          Submit
        </Button>
        <Button style={{ float: "right" }} onClick={clickHandler}>
          Next
        </Button>
      </Container>
    </div>
  )
}
