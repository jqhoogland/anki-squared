import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

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
} from "reactstrap";

import { FaPlay, FaStop } from "react-icons/fa";

const DEMO = require("./demo.json");

const ClickToEdit = (props) => {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(props.value);
  let res;

  if (props.value !== value) {
    setValue(props.value);
    setEdit(false);
  }

  const changeHandler = (e) => {
    setValue(e.target.value);
    props.setValue(e.target.value);
  };

  if (edit) {
    res = (
      <Input type="textarea" defaultValue={value} onChange={changeHandler} />
    );
  } else {
    res = <h1 onClick={() => setEdit(true)}>{value}</h1>;
  }

  return res;
};

const Pronunciation = (props) => {
  const chosen = props.isSelected === props.value;

  let audioProps = props.isSelected ? { autoplay: true } : {};
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
  );
};

const ImgChoice = (props) => {
  const chosen = props.isSelected === props.value;

  return (
    <Card
      onClick={props.onClick}
      className="p-1"
      color={chosen ? "dark" : "light"}
      style={{ maxWidth: "18rem" }}
    >
      <CardImg src={props.item.image} alt={props.item.title} />
    </Card>
  );
};

const getImages = (keyword) => {
  const request = new Request("/api/images", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(keyword),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  fetch(request)
    .then((res) => {
      console.log("images", res);
      // if (!res.ok) { throw res }
      // TODO: allow opaque requests
    })
    .then((res) => console.log("success"))
    .catch((e) => {
      console.error(e);
    });
};

export default function AddNote() {
  const [currCard, setCurrCard] = useState(0);
  const [alert, setAlert] = useState("");
  const [image, setImage] = useState(0);
  const [pronunciation, setPronunciation] = useState(0);
  const [useReverse, setUseReverse] = useState(false);
  const [marked, setMarked] = useState(false);
  const [wordType, setWordType] = useState("");
  const [currWord, setCurrWord] = useState(DEMO[currCard].word);

  //const imagesJson = getImages(currWord);
  const images = DEMO[currCard].images.map((item, j) => (
    <ImgChoice
      key={j}
      value={j}
      onClick={() => setImage(j)}
      item={item}
      isSelected={image}
    />
  ));

  const definition =
    DEMO[currCard].definitions.length > 0 &&
    DEMO[currCard].definitions[0].definitions.length > 0
      ? DEMO[currCard].definitions[0].definitions[0].text.join("\n")
      : "";

  const pronunciations = DEMO[currCard].pronunciations.map((item, j) => (
    <Pronunciation
      key={j}
      value={j}
      onClick={() => setPronunciation(j)}
      item={item}
      isSelected={pronunciation}
    />
  ));

  const nextCard = () => {
    setMarked(false);
    setWordType("");
    setUseReverse(false);
    setImage(0);
    setPronunciation(0);
    setCurrWord(DEMO[(currCard + 1) % DEMO.length].word);
    setCurrCard((currCard + 1) % DEMO.length);
  };

  const clickHandler = () => {
    let word = {};
    word.Word = currWord;
    word.Image =
      DEMO[currCard].images.length > 0
        ? DEMO[currCard].images[image].image
        : "";
    word.Pronunciation =
      DEMO[currCard].pronunciations.length > 0
        ? DEMO[currCard].pronunciations[pronunciation].pathmp3
        : "";
    word.HasRecognitionCard = useReverse ? "include" : "";
    word.WordType = wordType;
    word.Marked = marked;
    word.Definition = ""; //TODO: fill in later
    console.log("Creating word: ", word);

    const request = new Request("/api/upload", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(word),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    fetch(request)
      .then((res) => {
        console.log(res);
        // if (!res.ok) { throw res }
        // TODO: allow opaque requests
      })
      .then((res) => console.log("success"))
      .catch((e) => {
        setAlert("Could not create card");
      });

    nextCard();
  };

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
            <ClickToEdit value={currWord} setValue={setCurrWord} />
          </Container>
        </Col>
        <Col>
          <Container className="p-5">
            <h2>Definition</h2>
            <h4>{definition}</h4>
          </Container>
        </Col>
      </Row>

      <Row>
        <Col className="col-md-6">
          <h2>Image</h2>
          <CardColumns className="my-3">{images}</CardColumns>
        </Col>
        <Col className="col-md-6">
          <h2>Pronunciation</h2>
          <CardDeck className="my-3">{pronunciations}</CardDeck>
        </Col>
      </Row>

      <hr />
      <Row>
        <Col>
          <Container className="pb-5">
            <h4>Include Recognition?</h4>
            <Input
              type="checkbox"
              onClick={() => setUseReverse(!useReverse)}
              checked={useReverse}
              style={{ width: "30px", height: "30px" }}
            />
            <hr className="mt-5" />
            <h4>Mark</h4>
            <Input
              type="checkbox"
              onClick={() => setMarked(!marked)}
              checked={marked}
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
                      defaultChecked={wordType === ""}
                      onClick={() => setWordType("")}
                    />{" "}
                    Nessuna
                  </Label>
                </FormGroup>
                <Label check>
                  <Input
                    type="radio"
                    name="radio1"
                    defaultChecked={wordType === "S"}
                    onClick={() => setWordType("S")}
                  />{" "}
                  Sostantivo
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    name="radio1"
                    defaultChecked={wordType === "T"}
                    onClick={() => setWordType("T")}
                  />{" "}
                  Aggettivo
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    name="radio1"
                    defaultChecked={wordType === "V"}
                    onClick={() => setWordType("V")}
                  />{" "}
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
  );
}
