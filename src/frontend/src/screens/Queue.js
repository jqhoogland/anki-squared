import React, { useState, useEffect } from "react"

import {
  Row,
  Col,
  Button,
  Container,
  Form,
  InputGroup,
  Input,
  InputGroupAddon,
} from "reactstrap"

import { getQueue, addToQueue } from "../services/api.js"

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
  )
}

export default function Queue(props) {
  const [queue, setQueue] = useState([])
  const [word, setWord] = useState("")

  // Load the queue on mount
  useEffect(() => {
    getQueue().then((data) => setQueue(data.queue))
  }, [])

  // We get the queue back whenever we add new words
  const newWord = () => {
    addToQueue(word).then((res) => {
      if (res.queue) {
        setQueue(res.queue)
        setWord("")
      }
    })
  }

  // Return key triggers add to queue.
  const handleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // Enter
      e.preventDefault()
      newWord()
    }
  }

  return (
    <Container style={{ marginBottom: 200 }}>
      <h2>Queue</h2>
      <ol style={{ marginTop: 30 }}>
        {queue.map((q, i) => (
          <li key={`key-${i}`}>
            <a href={`/note/${i}`}>{q.word}</a>
          </li>
        ))}
      </ol>

      <Row style={{ marginTop: 50 }}>
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
  )
}
