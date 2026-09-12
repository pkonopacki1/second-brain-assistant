import type { AiMessageRole, Message } from './Types';

export interface AiProvider {
  generate(message: Message, role: AiMessageRole): Message;
}
