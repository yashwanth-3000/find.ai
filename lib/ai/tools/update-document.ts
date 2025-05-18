import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { getDocumentById, saveDocument } from '@/lib/storage';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';

// Define a custom Session type to replace next-auth dependency
interface CustomSession {
  user: {
    id: string;
  };
  expires: string;
}

interface UpdateDocumentProps {
  session: CustomSession;
  dataStream: DataStreamWriter;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const documents = await getDocumentById(id);
      const document = documents[0];

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.type,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.type}`);
      }

      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: document.title,
        kind: document.type,
        content: 'The document has been updated successfully.',
      };
    },
  });
