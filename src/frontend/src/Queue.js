import React, { useState, useEffect } from "react";

import {
  Row,
  Col,
  Button,
  Container,
  Form,
  InputGroup,
  Input,
  InputGroupAddon,
} from "reactstrap";

function QueueList({ words }) {
  return (
    <Container>
      {words.map((q, i) => (
        <Row>
          <h2 key={`key-${i}`}>
            {i} {q.word}
          </h2>
        </Row>
      ))}
    </Container>
  );
}

export default function Queue(props) {
  const [queue, setQueue] = useState([]);
  const [word, setWord] = useState("");
  const [wordAdded, setWordAdded] = useState("");

  useEffect(() => {
    fetch(`/api/queue`)
      .then((res) => res.json())
      .then((data) => setQueue(data.queue));
  }, [wordAdded]);

  const newWord = () => {
    setWordAdded(true);
    fetch("/api/queue/add", {
      method: "POST",
      body: JSON.stringify({ word }),
    }).then((res) => {
      if (res.status == 200) {
        setWord("");
      }
      setWordAdded(false);
    });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // Enter
      newWord();
    }
  };

  return (
    <Container>
      <QueueList words={queue} />
      <Row>
        <Form>
          <InputGroup>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={handleKeyDown}
            ></Input>
            <InputGroupAddon addOnType="append">
              <Button onClick={newWord}>Add</Button>
            </InputGroupAddon>
          </InputGroup>
        </Form>
      </Row>
    </Container>
  );
}
