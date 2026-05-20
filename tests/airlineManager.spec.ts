import { test } from '@playwright/test';
import { GeneralUtils } from '../utils/general.utils';
import { FuelUtils } from '../utils/fuel.utils';
import { CampaignUtils } from '../utils/campaign.utils';
import { FleetUtils } from '../utils/fleet.utils';
import { MaintenanceUtils } from '../utils/maintenance.utils';

require('dotenv').config();

test('All Operations', async ({ page }) => {
  test.setTimeout(60000);

  // Variable Initialization
  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);
  // End //

  // Login //
  await generalUtils.login(page);

  // Campaign Operations //
  await page.locator('div:nth-child(5) > #mapMaint > img').click();
  await campaignUtils.createCampaign();

  await page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons').click();
  await GeneralUtils.sleep(1000)
  // End //

  // Repair Planes if needed //
  await page.locator('div:nth-child(4) > #mapMaint > img').click();

  await maintenanceUtils.checkPlanes();
  await GeneralUtils.sleep(1000);
  await maintenanceUtils.repairPlanes();
  await GeneralUtils.sleep(1000);

  await page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons').click();
  // End //

  // Fuel + Depart Cycle: buy fuel/CO2 then depart one batch, repeat up to 10 times //
  for (let i = 0; i < 10; i++) {
    console.log(`Cycle ${i + 1}/10: Buying fuel and CO2...`);

    await page.locator('#mapMaint > img').first().click();
    await fuelUtils.buyFuel();

    await page.getByRole('button', { name: ' Co2' }).click();
    await GeneralUtils.sleep(1000);
    await fuelUtils.buyCo2();

    await page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons').click();

    console.log(`Cycle ${i + 1}/10: Departing one batch...`);

    await page.locator('#mapRoutes').getByRole('img').click();
    await GeneralUtils.sleep(2500);

    const hasMore = await fleetUtils.departOnce();
    if (!hasMore) {
      console.log('No more planes to depart. Stopping cycle early.');
      break;
    }
  }
  // End //

  page.close();
});
