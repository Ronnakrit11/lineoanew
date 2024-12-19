import { LineMessageEvent } from '@/app/types/line';
import { MessageValidationResult } from '../types';
import { isValidMessage } from '../types/messages';
import { validateMessageContent } from './content';

export function validateLineMessage(event: LineMessageEvent): MessageValidationResult {
  try {
    // Check event type
    if (event.type !== 'message') {
      return {
        isValid: false,
        error: 'Not a message event'
      };
    }

    // Check message type and validity
    if (!event.message || !isValidMessage(event.message)) {
      return {
        isValid: false,
        error: 'Invalid message format'
      };
    }

    // Handle different message types
    switch (event.message.type) {
      case 'text': {
        const validation = validateMessageContent(event.message.text);
        if (!validation.isValid) {
          return validation;
        }
        return {
          isValid: true,
          text: validation.content,
          messageType: 'text'
        };
      }

      case 'image':
        return {
          isValid: true,
          text: '[Image]',
          messageType: 'image'
        };

      default:
        return {
          isValid: false,
          error: 'Unsupported message type'
        };
    }
  } catch (error) {
    console.error('Error validating LINE message:', error);
    return {
      isValid: false,
      error: 'Message validation failed'
    };
  }
}