import React, {createContext, useState, useContext} from "react"

const LanguageContext = createContext()

const LANGUAGES = [
    "zh",
    "da",
    "nl",
    "en",
    "de",
    "el",
    "it",
    "ja",
    "lt",
    "mk",
    "xx",
    "nb",
    "pl",
    "pt",
    "ro",
    "ru",
    "es"
] // TODO ADD All languages supported by Forvo

const LanguageProvider = ({children}) => {
    const [language, setLanguage] = useState("en")

    return <LanguageContext.Provider value={{language, languages: LANGUAGES, setLanguage}}>
        {children}
    </LanguageContext.Provider>
}

export default LanguageProvider

export const useLanguage = () => {
    const languagesContext = useContext(LanguageContext)
    return languagesContext
}
