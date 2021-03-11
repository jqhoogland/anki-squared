import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom"
import AddNote from "./AddNote"
import AddNote2 from "./AddNote2"
import Queue from "./Queue"

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/note">Add Note</Link>
            </li>
            <li>
              <Link to="/queue">Queue</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/queue">
            <Queue />
          </Route>
          <Route path="/note/:noteIdx">
            <AddNote />
          </Route>
          <Route path="/note">
            <Redirect to="/note/0" />
          </Route>
          <Route path="/note2/:noteIdx">
            <AddNote2 />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
