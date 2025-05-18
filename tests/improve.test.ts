import { ImprovePage } from '@/tests/pages/improve';
import { test, expect } from '@playwright/test';

test.describe('improve activity', () => {
  let improvePage: ImprovePage;

  test.beforeEach(async ({ page }) => {
    improvePage = new ImprovePage(page);
    await improvePage.createNewImprove();
  });

  test('send a user message and receive response', async () => {
    await improvePage.sendUserMessage('Why is grass green?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toContain("It's just green duh!");
  });

  test('redirect to /improve/:id after submitting message', async () => {
    await improvePage.sendUserMessage('Why is grass green?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toContain("It's just green duh!");
    await improvePage.hasImproveIdInUrl();
  });

  test('send a user message from suggestion', async () => {
    await improvePage.sendUserMessageFromSuggestion();
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toContain(
      'With Next.js, you can ship fast!',
    );
  });

  test('toggle between send/stop button based on activity', async () => {
    await expect(improvePage.sendButton).toBeVisible();
    await expect(improvePage.sendButton).toBeDisabled();

    await improvePage.sendUserMessage('Why is grass green?');

    await expect(improvePage.sendButton).not.toBeVisible();
    await expect(improvePage.stopButton).toBeVisible();

    await improvePage.isGenerationComplete();

    await expect(improvePage.stopButton).not.toBeVisible();
    await expect(improvePage.sendButton).toBeVisible();
  });

  test('stop generation during submission', async () => {
    await improvePage.sendUserMessage('Why is grass green?');
    await expect(improvePage.stopButton).toBeVisible();
    await improvePage.stopButton.click();
    await expect(improvePage.sendButton).toBeVisible();
  });

  test('edit user message and resubmit', async () => {
    await improvePage.sendUserMessage('Why is grass green?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toContain("It's just green duh!");

    const userMessage = await improvePage.getRecentUserMessage();
    await userMessage.edit('Why is the sky blue?');

    await improvePage.isGenerationComplete();

    const updatedAssistantMessage = await improvePage.getRecentAssistantMessage();
    expect(updatedAssistantMessage.content).toContain("It's just blue duh!");
  });

  test('hide suggested actions after sending message', async () => {
    await improvePage.isElementVisible('suggested-actions');
    await improvePage.sendUserMessageFromSuggestion();
    await improvePage.isElementNotVisible('suggested-actions');
  });

  test('upload file and send image attachment with message', async () => {
    await improvePage.addImageAttachment();

    await improvePage.isElementVisible('attachments-preview');
    await improvePage.isElementVisible('input-attachment-loader');
    await improvePage.isElementNotVisible('input-attachment-loader');

    await improvePage.sendUserMessage('Who painted this?');

    const userMessage = await improvePage.getRecentUserMessage();
    expect(userMessage.attachments).toHaveLength(1);

    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe('This painting is by Monet!');
  });

  test('call weather tool', async () => {
    await improvePage.sendUserMessage("What's the weather in sf?");
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();

    expect(assistantMessage.content).toBe(
      'The current temperature in San Francisco is 17°C.',
    );
  });

  test('upvote message', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    await assistantMessage.upvote();
    await improvePage.isVoteComplete();
  });

  test('downvote message', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    await assistantMessage.downvote();
    await improvePage.isVoteComplete();
  });

  test('update vote', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    await assistantMessage.upvote();
    await improvePage.isVoteComplete();

    await assistantMessage.downvote();
    await improvePage.isVoteComplete();
  });
}); 