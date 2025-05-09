# Motorcycle Workshop Management Application

## Overview

The Motorcycle Workshop Management Application is a comprehensive web-based tool built with Vue 3, Composition API, Vue Router, Pinia, and Firebase. It helps users manage motorcycle maintenance and modification projects through various features including project management, task tracking, parts management, cost tracking, and helpdesk support.

## Core Features

### 1. Project Management
- Users can create, edit, view, and manage motorcycle projects
- Each project includes details like VIN, make, model, year, and status
- Project progress tracking and image upload capabilities

### 2. Task Management
- Create and assign tasks for each project
- Track task status (Pending, In Progress, Completed)
- Set task priorities and track hours spent

### 3. Parts Management
- Catalog parts needed for projects
- Track part status (Ordered, Shipped, BackOrder, Installed)
- Parts inventory lookup

### 4. Cost Tracking
- Monitor expenses for each project
- Categorize costs (Parts, Labor, Tools, Other)
- Financial reporting and analysis

### 5. Helpdesk & Knowledge Base
- Submit and track support tickets
- Search and contribute to the knowledge base
- Categories for different types of issues

## Community & Contribution System

### Points & Badges
The application incorporates a gamified contribution system that rewards users for participating in the community:

1. **Contribution Types:**
   - Validating tasks
   - Submitting knowledge base articles
   - Helping others with projects
   - Creating useful content

2. **Points System:**
   - Users earn points for different contribution types
   - Point values vary based on contribution value:
     - Answer questions: 5 points
     - Validate answers: 2 points
     - Create content: 10 points
     - Validate content: 3 points

3. **Badges & Roles:**
   - At 100 points: User earns "Contributor Level 1" badge
   - At 500 points: User earns "Contributor Level 2" badge and is promoted to "moderator" role
   - Badges appear on user profiles

4. **Subscription Benefits:**
   - Earned points can extend subscription time
   - Every 100 credits = 1 day of subscription extension (capped at 30 days per month)
   - Only applicable for free and standard subscriptions

### Knowledge Base Contribution

The application includes a comprehensive knowledge base editor that allows users to:

1. **Create Articles:**
   - Rich markdown editing with toolbar for formatting
   - Preview functionality
   - Tag and categorize articles
   - Option to publish immediately or save as draft

2. **Review Process:**
   - Articles can be validated by community members
   - Validation earns points for both author and validator
   - Admin approval may be required for certain content

3. **Article Usage:**
   - Search functionality across the knowledge base
   - Filter by category or tags
   - Track views and "helpful" ratings

## Subscription Tiers

The app offers multiple subscription tiers:

1. **Free:**
   - Basic project management
   - Limited tasks and parts
   - Community access

2. **Standard:**
   - More projects, tasks, and parts
   - Export capabilities

3. **Premium & Professional:**
   - Advanced features like helpdesk access
   - Inventory management
   - Analytics and reporting
   - White label options (Professional only)

## Validation Workflow

When a user wants to validate content or contribute to the knowledge base:

1. User reviews the content (task, article, part information)
2. User provides feedback or confirmation of accuracy
3. User submits validation
4. System awards points based on contribution type
5. System checks if the user qualifies for new badges or role upgrades
6. If applicable, subscription time is extended based on earned points
7. The validated content receives a "validated" status, improving its reliability score

The validation system creates a positive feedback loop where:
- Quality contributions are rewarded
- Users are incentivized to participate
- Content quality improves through peer review
- Active users receive tangible benefits (badges, roles, and subscription extensions)

This system is managed through the `contributionStore`, which tracks contributions, awards points, checks for badge eligibility, and handles role upgrades.