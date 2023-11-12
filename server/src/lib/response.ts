import { PayloadType } from '../types'

export class WebSocketResponse {
  constructor(
    private type: PayloadType,
    private payload: unknown
  ) {}

  json() {
    return JSON.stringify({
      type: this.type,
      payload: this.payload
    })
  }
}
