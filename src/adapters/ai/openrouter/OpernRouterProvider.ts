import { OpenRouter } from '@openrouter/sdk';
import type { ChatRequest } from '@openrouter/sdk/models';
import type { SendChatCompletionRequestResponse } from '@openrouter/sdk/models/operations';
import type { AiProvider } from '../../../domain/ai/AiProvider';
import {
  err,
  type AiNormalizedMessage,
  type AiRequest,
  type Result,
} from '../../../domain/ai/Types';

interface OpenRouterConfig {
  apiKey: string;
}

function normalizeMessage(response: SendChatCompletionRequestResponse): AiNormalizedMessage {
  if (response instanceof ReadableStream) {
    throw new Error('Expected a non-streaming response');
  }
  const message = response.choices[0]?.message;
  if (!message || !message.content) {
    throw new Error('No message found in response');
  }

  if (message.content instanceof Array) {
    throw new Error('Message content type not supported');
  }

  return {
    role: message.role,
    content: message.content,
  };
}

function createOpenRouterRequest(request: AiRequest): ChatRequest {
  return {
    model: request.model,
    messages: request.messages,
  };
}

export function createOpenRouterProvider(config: OpenRouterConfig): AiProvider {
  const client = new OpenRouter({
    apiKey: config.apiKey,
  });

  return {
    generate: async (request): Promise<Result<AiNormalizedMessage, string>> => {
      if (!client) {
        return err('Client not initialized');
      }

      return client.chat
        .send({
          chatRequest: createOpenRouterRequest(request),
        })
        .then(
          (response) => {
            return { ok: true, result: normalizeMessage(response) };
          },
          (error) => {
            return err(error.message);
          },
        );
    },
  };
}
