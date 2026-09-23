import type { AiNormalizedMessage, AiRequest, Result } from './Types';

export interface AiProvider {
  generate(request: AiRequest): Promise<Result<AiNormalizedMessage, string>>;
}
