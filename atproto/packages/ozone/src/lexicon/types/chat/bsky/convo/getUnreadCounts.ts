/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons.js'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'chat.bsky.convo.getUnreadCounts'

export type QueryParams = {
  /** When false, group convos are excluded from the counts. */
  includeGroupChats: boolean
}
export type InputSchema = undefined

export interface OutputSchema {
  /** Number of unread, unlocked accepted convos. Counts convos with unread messages and unread join requests. Capped at 100, where 100 means more than 99. */
  unreadAcceptedConvos: number
  /** Number of unread, unlocked request convos. Includes convos with unread messages, but not with unread join request, since only the owner of a group has join requests to read, and the group would necessarily be accepted. Capped at 100, where 100 means more than 99. */
  unreadRequestConvos: number
}

export type HandlerInput = void

export interface HandlerSuccess {
  encoding: 'application/json'
  body: OutputSchema
  headers?: { [key: string]: string }
}

export interface HandlerError {
  status: number
  message?: string
}

export type HandlerOutput = HandlerError | HandlerSuccess
