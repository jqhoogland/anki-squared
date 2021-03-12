import axios from "axios"
import {useState} from "react";

export const invoke = (action, version, params={}) =>
    axios.post("http://localhost:8765", {action, version, params})


// CUSTOM HOOKS

export const useBool = (defaultValue = false) => {
    const [value, setValue] = useState(defaultValue)
    const toggleValue = () => setValue(!value)
    return [value, toggleValue]
}
