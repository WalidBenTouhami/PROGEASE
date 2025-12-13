# Upgrade Notes

## December 2024 - Dependency Updates

### Fixed Issues

#### 1. Missing Test Dependencies (Jest)
- **Issue**: Jest was not installed at the root level, causing test script failures
- **Fix**: Added jest ^29.7.0 to root devDependencies
- **Action Required**: Run `npm install` in the root directory
- **Test Scripts Added**:
  - `npm test` - Runs all tests (backend + frontend)
  - `npm run test:backend` - Runs backend tests only
  - `npm run test:frontend` - Runs frontend tests only

#### 2. Angular Version Mismatch
- **Issue**: Root package.json had Angular 18.2.0 while frontend/package.json had Angular 17.3.0
- **Fix**: Updated frontend Angular dependencies from 17.3.0 to 18.2.0 to match root configuration

### Breaking Changes

#### Angular Upgrade (17.3.0 → 18.2.0)

**Updated Dependencies:**
- All `@angular/*` packages: `^17.3.0` → `^18.2.0`
- `@angular/cdk`: `^17.3.0` → `^18.2.0`
- `@angular/material`: `^17.3.0` → `^18.2.0`
- `@ngrx/*` packages: `^17.0.0` → `^18.0.0`
- `apollo-angular`: `^6.0.0` → `^7.0.0`

**Removed:**
- `@sentry/tracing` (deprecated, functionality now included in `@sentry/angular`)

**Required Actions:**
1. Delete `node_modules` and `package-lock.json` in frontend directory:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   ```

2. Run clean install:
   ```bash
   npm install
   ```

3. **Review Angular 18 Breaking Changes**:
   - Check [Angular Update Guide](https://angular.dev/update-guide) for potential breaking changes
   - Review your code for deprecated APIs
   - Common breaking changes in Angular 18:
     - Stricter type checking in templates
     - Standalone components are now recommended (migration optional)
     - Some lifecycle hooks may require updates
     - Route configuration changes may be needed

4. **Test thoroughly**:
   ```bash
   npm run test
   npm run build
   npm start
   ```

5. **Update TypeScript** (if needed):
   - Angular 18 requires TypeScript ~5.2.2 or higher
   - Current version in frontend: `~5.2.2` ✓ (already compatible)

6. **Apollo Angular v7 Breaking Changes**:
   - Apollo Angular v7 introduces breaking changes from v6
   - Review and update GraphQL query implementations
   - Check cache management configuration
   - Verify subscription handling works correctly
   - Refer to [Apollo Angular v7 Migration Guide](https://www.apollographql.com/docs/angular/)

### Additional Notes

- The root package.json now includes jest for test dependency consistency
- All Angular-related packages are now aligned at version 18.2.0
- NgRx packages updated to version 18 to maintain compatibility
- Apollo Angular updated to v7 for Angular 18 compatibility
- No changes required for backend dependencies

### Migration Testing Checklist

- [ ] Run `npm run install-all` from root directory
- [ ] Verify backend tests pass: `npm run test:backend`
- [ ] Verify frontend builds: `cd frontend && npm run build`
- [ ] Verify frontend tests pass: `npm run test:frontend` (if configured)
- [ ] Test development server: `npm start`
- [ ] Check for console errors in browser
- [ ] Verify all features work as expected
- [ ] Update any custom Angular code if using deprecated APIs

### Rollback Instructions

If you encounter issues and need to rollback:

1. Revert the changes:
   ```bash
   git checkout HEAD -- package.json frontend/package.json
   ```

2. Reinstall dependencies:
   ```bash
   npm run install-all
   ```

### Support

For Angular 18 migration issues, refer to:
- [Angular Update Guide](https://angular.dev/update-guide)
- [Angular 18 Release Notes](https://github.com/angular/angular/releases)
- [NgRx 18 Migration Guide](https://ngrx.io/guide/migration/v18)
