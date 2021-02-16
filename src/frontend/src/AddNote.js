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

import { getImages, editNote, getNote } from "./services/api"

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

  return (
    <Container className="App p-5">
      {alert ? (
        <Alert color="danger" toggle={() => setAlert("")}>
          {alert}
        </Alert>
      ) : (
        ""
      )}
      <Row>
        <Col>
          <Container className="p-5">
            <h2>Word</h2>
            <ClickToEdit value={note.word} setValue={setWord} />
          </Container>
        </Col>
        <Col>
          <Container className="p-5">
            <h2>Definition</h2>
            <h4>{note.definition}</h4>
          </Container>
        </Col>
      </Row>

      <Row>
        <Col className="col-md-6">
          <h2>Image</h2>
          <CardColumns className="my-3">{note.images}</CardColumns>
        </Col>
        <Col className="col-md-6">
          <h2>Pronunciation</h2>
          <CardDeck className="my-3">{note.pronunciations}</CardDeck>
        </Col>
      </Row>

      <hr />
      <Row>
        <Col>
          <Container className="pb-5">
            <h4>Include Recognition?</h4>
            <Input
              type="checkbox"
              onClick={toggleIsIncludeRecognition}
              checked={note.is_include_recognition === true}
              style={{ width: "30px", height: "30px" }}
            />
            <hr className="mt-5" />
            <h4>Mark</h4>
            <Input
              type="checkbox"
              onClick={toggleIsMarked}
              checked={note.is_marked === true}
              style={{ width: "30px", height: "30px" }}
            />
          </Container>
        </Col>
        <Col>
          <Container>
            <h4>Word Type</h4>
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
        </Col>
      </Row>
      <hr />
      <Button onClick={clickHandler}>Next</Button>
    </Container>
  )
}
