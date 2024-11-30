export interface Question {
    id: number
    text: string
    submitter_id: number
    answers: Answer[]
}

export interface Answer {
    id: number
    text: string
    question_id: number
    submitter_id: number
    likes_count: number
    submitter: User
}

export interface User {
    id: number
    username: string
    is_expert: string
}