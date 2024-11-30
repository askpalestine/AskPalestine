export enum InputType {
  TEXT = 'text',
  TEXT_MULTI_LINE = 'textarea',
  PASSWORD = 'password',
  EMAIL = 'email',
  PHOTO = 'file',
}

export interface Props {
  // Example: username, password, email
  name: string
  type?: InputType
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onChangeTextArea?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}
