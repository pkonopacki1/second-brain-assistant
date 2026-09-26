export type AiNormalizedMessage =
  | {
      role: 'user' | 'assistant' | 'system' | 'developer';
      content: string;
    }
  | {
      role: 'tool';
      content: string;
      toolCallId: string;
    };

export type AiRequest = {
  messages: AiNormalizedMessage[];
  model: string;
};

export type Result<TValue, TError> = { ok: true; result: TValue } | { ok: false; error: TError };
export function ok<TValue>(value: TValue): Result<TValue, never> {
  return {
    ok: true,
    result: value,
  };
}

export function err<TError>(error: TError): Result<never, TError> {
  return {
    ok: false,
    error: error,
  };
}
