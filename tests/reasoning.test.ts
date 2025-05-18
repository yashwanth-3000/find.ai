import { ImprovePage } from './pages/improve';
import { test, expect } from '@playwright/test';

test.describe('improve activity with reasoning', () => {
  let improvePage: ImprovePage;

  test.beforeEach(async ({ page }) => {
    improvePage = new ImprovePage(page);
    await improvePage.createNewImprove();
  });

  test('send user message and generate response with reasoning', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe("It's just blue duh!");

    expect(assistantMessage.reasoning).toBe(
      'The sky is blue because of rayleigh scattering!',
    );
  });

  test('toggle reasoning visibility', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    const reasoningElement =
      assistantMessage.element.getByTestId('message-reasoning');
    expect(reasoningElement).toBeVisible();

    await assistantMessage.toggleReasoningVisibility();
    await expect(reasoningElement).not.toBeVisible();

    await assistantMessage.toggleReasoningVisibility();
    await expect(reasoningElement).toBeVisible();
  });

  test('edit message and resubmit', async () => {
    await improvePage.sendUserMessage('Why is the sky blue?');
    await improvePage.isGenerationComplete();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    const reasoningElement =
      assistantMessage.element.getByTestId('message-reasoning');
    expect(reasoningElement).toBeVisible();

    const userMessage = await improvePage.getRecentUserMessage();

    await userMessage.edit('Why is grass green?');
    await improvePage.isGenerationComplete();

    const updatedAssistantMessage = await improvePage.getRecentAssistantMessage();

    expect(updatedAssistantMessage.content).toBe("It's just green duh!");

    expect(updatedAssistantMessage.reasoning).toBe(
      'Grass is green because of chlorophyll absorption!',
    );
  });
});
