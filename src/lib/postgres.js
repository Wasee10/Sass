/**
 * Backward compatibility proxy for PostgreSQL server database & services
 * All server database implementations live in @/server/db and @/server/services
 */

import { getPostgresPool, query } from '@/server/db';
import { saveUserPackage, getUserPackage } from '@/server/services/package.service';

export const saveUserPackageToPostgres = saveUserPackage;
export const getUserPackageFromPostgres = getUserPackage;
export { getPostgresPool, query };

export default {
  getPostgresPool,
  query,
  saveUserPackageToPostgres,
  getUserPackageFromPostgres,
};
