import { z } from 'zod';
import { DataStreamWriter, streamObject, tool } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/storage';
import { Suggestion } from '@/lib/storage';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '../providers';

// Define a custom Session type to replace next-auth dependency
interface CustomSession {
  user: {
    id: string;
  };
  expires: string;
}

interface RequestSuggestionsProps {
  session: CustomSession;
  dataStream: DataStreamWriter;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }) => {
      const documents = await getDocumentById(documentId);
      const document = documents[0];

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'createdAt'>
      > = [];

      const { elementStream } = streamObject({
        model: myProvider.languageModel('artifact-model'),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          id: generateUUID(),
          documentId: documentId,
          suggestedText: element.suggestedSentence,
          startPos: 0, // Placeholder values for position
          endPos: 0,   // These should be calculated based on document content
        };

        dataStream.writeData({
          type: 'suggestion',
          content: {
            ...suggestion,
            originalText: element.originalSentence,
            description: element.description,
            isResolved: false,
          },
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        await saveSuggestions(suggestions);
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.type, // Using type instead of kind
        message: 'Suggestions have been added to the document',
      };
    },
  });
