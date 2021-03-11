import axios from "axios"

export const invoke = (action, version, params={}) => {
    axios.post("http://localhost:8765", {action, version, params})
}
