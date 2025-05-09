# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-05-08

### Added
- TypeScript support throughout the application
- ESLint configuration for TypeScript and Vue
- Type definitions for all major interfaces
- New helpdesk components with TypeScript support
- KnowledgeBaseEditor component for helpdesk articles
- `typecheck` and `lint` npm scripts

### Changed
- Migrated core stores to TypeScript
  - userStore
  - projectStore
  - taskStore
  - partStore
  - costStore
  - errorStore
- Upgraded main.js to main.ts with proper typing
- Updated router configuration to use TypeScript
- Migrated navBar component to TypeScript

### Technical Improvements
- Better code completion and type checking
- Runtime error prevention through static analysis
- Improved IDE support for developers
- Enhanced documentation through TypeScript interfaces

## [0.1.0] - Initial Release

### Added
- Initial application setup
- Firebase integration
- User authentication
- Project management
- Task tracking
- Parts inventory
- Cost tracking