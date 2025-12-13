# Upgrade Notes

## December 2024 - Comprehensive Dependency Security Audit and Updates

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

---

## December 13, 2024 - Security Vulnerability Fixes

### Critical Security Updates

This release addresses multiple high and critical severity vulnerabilities across the project.

#### Fixed Vulnerabilities

**Backend:**
1. **axios (DoS vulnerability)** - Updated from 1.6.7 to 1.13.2
   - Fixes GHSA-4hjh-wcwx-xvwj: DoS attack through lack of data size check
   - **Action Required**: None, automatic with `npm install`

2. **nodemailer** - Updated from 6.9.7 to 7.0.11
   - Fixes GHSA-mm7p-fcc7-pg87: Email to unintended domain
   - Fixes GHSA-rcmh-qjqh-p98v: DoS via recursive calls in addressparser
   - **⚠️ Breaking Change**: Review email sending code for API changes
   - **Action Required**: Test all email functionality after upgrade

3. **@apollo/gateway** - Updated from 2.7.1 to 2.12.2
   - Fixes access control issues in Apollo Federation
   - **Action Required**: Test GraphQL queries and federation setup

4. **express** - Updated from 4.18.2 to 4.22.1
   - General security and bug fixes
   - **Action Required**: None, backward compatible

5. **express-validator** - Updated from 7.0.1 to 7.3.1
   - Fixes validator.js URL validation bypass (GHSA-9965-vmph-33xx)
   - **Action Required**: Test all validation logic

6. **compression** - Updated from 1.8.0 to 1.8.1
   - Security patches
   - **Action Required**: None

7. **morgan** - Updated from 1.10.0 to 1.10.1
   - Security patches
   - **Action Required**: None

**Root & Frontend:**
1. **Angular packages** - Updated from 18.2.0 to 18.2.14
   - Latest Angular 18.2.x patches applied
   - ⚠️ **Known Issue**: Angular 18.2.14 still contains XSS vulnerabilities:
     - GHSA-58c5-g7wp-6w37: XSRF Token Leakage via Protocol-Relative URLs
     - GHSA-v4hv-rgfq-gp49: XSS via SVG Animation, SVG URL and MathML Attributes
   - **Mitigation**: These vulnerabilities require Angular 19.2.16+ to fix
   - **Recommended**: Plan upgrade to Angular 19.2.16+ or Angular 21.0.2+ for full mitigation
   - **Affected packages**: All @angular/* packages updated to 18.2.14

2. **bcryptjs (root)** - Updated from 3.0.2 to 3.0.3
   - Security patches
   - **Action Required**: None

3. **nodemailer (root)** - Updated from 7.0.3 to 7.0.11
   - Same fixes as backend nodemailer
   - **Action Required**: Test any root-level email functionality

4. **@ngrx packages** - Updated from 18.0.0 to 18.1.1
   - Bug fixes and improvements
   - **Action Required**: None, backward compatible

5. **apollo-angular** - Updated from 7.0.0 to 7.2.1
   - Bug fixes and improvements
   - **Action Required**: None, backward compatible

#### Remaining Vulnerabilities

**Backend (Dev Dependencies Only):**
- `newman` test tool has vulnerabilities in `jose` and `node-forge` dependencies
- **Impact**: Development/testing only, does not affect production code
- **Action Required**: None for production; consider alternative test tools if concerned

**Angular XSS Vulnerabilities (Production):**
- Angular 18.2.14 contains unfixed XSS vulnerabilities (see above)
- **Impact**: Potential XSS attacks via:
  - Protocol-relative URLs in HTTP client
  - SVG animations, SVG URLs, and MathML attributes
- **Workaround**: 
  - Validate and sanitize all user input
  - Use Angular's built-in sanitization
  - Avoid using protocol-relative URLs
  - Carefully review any SVG or MathML content from users
- **Long-term Fix**: Upgrade to Angular 19.2.16+ or 21.0.2+

### Installation Instructions

1. **Backend**:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   npm test  # Verify tests pass
   ```

2. **Frontend**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   npm test  # Verify tests pass
   npm run build  # Verify build succeeds
   ```

3. **Root**:
   ```bash
   npm install --legacy-peer-deps
   npm test  # Run all tests
   ```

### Testing Checklist

After updating dependencies:

- [ ] Backend tests pass: `cd backend && npm test`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Frontend tests pass: `cd frontend && npm test`
- [ ] Email functionality works (nodemailer v7 breaking changes)
- [ ] GraphQL queries work correctly (Apollo updates)
- [ ] All validation logic works (express-validator update)
- [ ] Development server starts: `npm start`
- [ ] Production build works
- [ ] No new console errors in browser

### Security Recommendations

1. **Immediate**:
   - Apply these updates as soon as possible
   - Test thoroughly in staging environment
   - Monitor application logs for any issues

2. **Short-term** (1-2 months):
   - Plan Angular 19.2.16+ or 21.0.2+ upgrade
   - Review and update any deprecated API usage
   - Consider moving from apollo-server-express to @apollo/server v5

3. **Ongoing**:
   - Run `npm audit` regularly (weekly recommended)
   - Subscribe to security advisories for key dependencies
   - Keep dependencies updated with latest patches

### Breaking Changes Summary

**nodemailer (6.9.7 → 7.0.11)**:
- May have API changes in email sending
- Review documentation: https://nodemailer.com/
- Test all email functionality thoroughly

**express-validator (7.0.1 → 7.3.1)**:
- Validator.js security fixes may affect validation behavior
- Test all validation logic, especially URL validation

### Rollback Instructions

If issues occur after updating:

1. **Backend**:
   ```bash
   cd backend
   git checkout HEAD -- package.json package-lock.json
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

2. **Frontend**:
   ```bash
   cd frontend
   git checkout HEAD -- package.json package-lock.json
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

3. **Root**:
   ```bash
   git checkout HEAD -- package.json package-lock.json
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

### Additional Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Angular Security Guide](https://angular.io/guide/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Apollo Server Security](https://www.apollographql.com/docs/apollo-server/security/authentication/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
