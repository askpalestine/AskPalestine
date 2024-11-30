import { Dispatch } from "react"
import { deleteEntry } from "./dataRequests"

export const handleDelete = (idx: number, data: object[], setData: Dispatch<object[]>, url: string) => {
    deleteEntry(url)
    let newData = [...data]
    newData.splice(idx, 1)
    setData(newData)
  }