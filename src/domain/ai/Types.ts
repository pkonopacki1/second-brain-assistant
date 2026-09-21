export type AiMessageRole = 'user' | 'assistant' | 'system' | 'developer' | 'tool';
export type AiNormalizedMessage = {
  content: string;
  mode: string;
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
