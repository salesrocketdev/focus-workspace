import type { Locator } from '@playwright/test';

export async function openNavigation(nav: Locator, label: string) {
 const name = label === 'Ajustes' ? 'Configurações' : label;
 const more = nav.getByRole('button', { name: 'Mais', exact: true });
 if (await more.isVisible() && !['Hoje','Agenda','Tarefas','Mais'].includes(name)) {
  await more.click();
  await nav.page().getByRole('dialog', { name: 'Mais', exact: true }).getByRole('button', { name, exact: true }).click();
 } else {
  await nav.getByRole('button', { name, exact: true }).click();
 }
}
