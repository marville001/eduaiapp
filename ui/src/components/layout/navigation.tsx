import { navbarMenuApi } from '@/lib/api/navbar-menu.api';
import settingsApi from '@/lib/api/settings.api';
import NavigationRenderer from './navigation-renderer';

export const dynamic = 'force-dynamic';

export default async function Navigation() {
  const [menus, settings] = await Promise.all([
    navbarMenuApi.getHierarchical(false).catch(() => []),
    settingsApi.getSettings()
  ]);

  return (
    <NavigationRenderer menus={menus || []} settings={settings || {}} />
  );
}