import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { ImprovePage } from './pages/improve';

const reasoningFile = path.join(
  __dirname,
  '../playwright/.reasoning/session.json',
);

setup('switch to reasoning model', async ({ page }) => {
  const improvePage = new ImprovePage(page);
  await improvePage.createNewImprove();

  await improvePage.chooseModelFromSelector('chat-model-reasoning');

  await expect(improvePage.getSelectedModel()).resolves.toEqual('Reasoning model');

  await page.waitForTimeout(1000);
  await page.context().storageState({ path: reasoningFile });
});
