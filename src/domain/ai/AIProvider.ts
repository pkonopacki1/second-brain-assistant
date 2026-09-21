import type { AiMessageRole, Message, Result } from './Types';

export interface AiProvider {
  generate(message: Message, role: AiMessageRole): Promise<Result<Message, string>>;
}
