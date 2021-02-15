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
    <Container>
      <Container>
        {queue.map((q, i) => (
          <Row>
            <a href={`/note/${i}`}>
              <h2 key={`key-${i}`}>
                {i}. {q.word}
              </h2>
            </a>
          </Row>
        ))}
      </Container>
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
  )
}
