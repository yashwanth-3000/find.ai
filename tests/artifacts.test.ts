import { expect, test } from '@playwright/test';
import { ImprovePage } from './pages/improve';
import { ArtifactPage } from './pages/artifact';

test.describe('artifacts activity', () => {
  let improvePage: ImprovePage;
  let artifactPage: ArtifactPage;

  test.beforeEach(async ({ page }) => {
    improvePage = new ImprovePage(page);
    artifactPage = new ArtifactPage(page);

    await improvePage.createNewImprove();
  });

  test('create a text artifact', async () => {
    await improvePage.createNewImprove();

    await improvePage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await improvePage.hasImproveIdInUrl();
  });

  test('toggle artifact visibility', async () => {
    await improvePage.createNewImprove();

    await improvePage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await improvePage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await artifactPage.closeArtifact();
    await improvePage.isElementNotVisible('artifact');
  });

  test('send follow up message after generation', async () => {
    await improvePage.createNewImprove();

    await improvePage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await artifactPage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await artifactPage.sendUserMessage('Thanks!');
    await artifactPage.isGenerationComplete();

    const secondAssistantMessage = await improvePage.getRecentAssistantMessage();
    expect(secondAssistantMessage.content).toBe("You're welcome!");
  });
});
