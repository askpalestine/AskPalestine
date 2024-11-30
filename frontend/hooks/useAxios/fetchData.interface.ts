import { Method } from "axios";

export interface Props {
    url: string,
    method: Method,
    body?: object,
    headers?: object
}