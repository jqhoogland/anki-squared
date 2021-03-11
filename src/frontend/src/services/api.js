export const getImages = (keyword) => {
  const request = new Request("/api/resources/images", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(keyword),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })

  fetch(request)
    .then((res) => {
      console.log("images", res)
      // if (!res.ok) { throw res }
      // TODO: allow opaque requests
    })
    .then((res) => console.log("success"))
    .catch((e) => {
      console.error(e)
    })
}

export const editNote = (noteIdx, note) =>
  fetch(`/api/notes/edit/${noteIdx}`, {
    method: "POST",
    body: JSON.stringify(note),
  })

export const getNote = async (noteIdx) =>
  fetch(`/api/notes/${noteIdx}`).then((res) => res.json())

export const addToQueue = async (word) =>
  fetch("/api/queue/add", {
    method: "POST",
    body: JSON.stringify({ word }),
  }).then((res) => res.json())

export const getQueue = async () =>
  fetch(`/api/queue`).then((res) => res.json())

export const getDecks = async () => {
   const request = await new Request("http://127.0.0.1:5000/api/decks", {
    method: "GET",
    mode: "no-cors",
   })
    return fetch(request).then(res => res.json())
}

export const getModels = async () =>
    fetch('/api/notes/models').then(res => res.json())