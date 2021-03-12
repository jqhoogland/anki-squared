import axios from "axios"
import {useState} from "react";

export const invoke = (action, version, params={}) =>
    axios.post("http://localhost:8765", {action, version, params})


// CUSTOM HOOKS

export const useBool = (defaultValue) => {
    const [value, setValue] = useState(!!defaultValue)
    const toggleValue = () => setValue(!value)
    return [value, toggleValue]
}

export const getFileNameFromUrl = (url) => {
    if (url) {
        const tmp = url.split('/');
        const tmpLength = tmp.length;

        return tmpLength ? tmp[tmpLength - 1] : '';
    }

    return '';
};
