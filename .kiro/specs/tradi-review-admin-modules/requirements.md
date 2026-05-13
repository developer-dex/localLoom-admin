# Requirements Document

## Introduction

This document specifies the requirements for two admin moderation modules in the LocalLoom admin panel: the Tradies Module and the Review Module. Both modules implement an approval workflow where content submitted by users (tradie profiles and customer reviews) is reviewed by an administrator before becoming publicly visible on the customer-facing platform.

The Tradies Module allows administrators to view tradie profile submissions (including uploaded documents, images, and business details), and approve or reject them. Only approved tradies appear in customer-facing listings.

The Review Module allows administrators to moderate customer reviews before they become visible to other customers. Administrators can approve or reject reviews based on content quality and policy compliance.

## Glossary

- **Admin_Panel**: The LocalLoom administration single-page application built with React, TypeScript, and Vite
- **Admin_User**: An authenticated administrator who moderates content through the Admin_Panel
- **Tradie_Module**: The admin feature module responsible for listing, viewing, and moderating tradie profile submissions
- **Review_Module**: The admin feature module responsible for listing, viewing, and moderating customer review submissions
- **Approval_Status**: The moderation state of a record, one of: `pending`, `approved`, or `rejected`
- **Tradie_Profile**: A tradesperson's business profile containing business name, ABN, service description, categories, regions, images, and documents
- **Customer_Review**: A review submitted by a customer for an approved tradie, containing a rating (1-5) and optional comment
- **Data_Table**: A reusable table component (shadcn/ui) used to display paginated, filterable lists of records
- **Status_Badge**: A visual indicator (shadcn Badge component) showing the current Approval_Status of a record
- **Detail_Dialog**: A modal dialog displaying the full details of a single tradie profile or review
- **Admin_API**: The backend Express.js REST API at `/api/admin` requiring `authenticateAdmin` middleware
- **Bulk_Action**: An operation applied to multiple selected records simultaneously

## Requirements

### Requirement 1: Tradie List View

**User Story:** As an Admin_User, I want to view a paginated list of all tradie profile submissions with their current moderation status, so that I can efficiently manage the approval queue.

#### Acceptance Criteria

1. WHEN the Admin_User navigates to the tradies route, THE Tradie_Module SHALL display a Data_Table containing all tradie profiles with columns for business name, ABN, category, region, Approval_Status, and submission date
2. THE Tradie_Module SHALL display a Status_Badge for each tradie profile showing the current Approval_Status using distinct colors (amber for pending, green for approved, red for rejected)
3. WHEN the Admin_User selects a status filter, THE Tradie_Module SHALL display only tradie profiles matching the selected Approval_Status
4. THE Tradie_Module SHALL paginate results with a configurable page size and display pagination controls below the Data_Table
5. WHEN the Admin_User types in the search field, THE Tradie_Module SHALL filter the tradie list by business name or ABN matching the search term

### Requirement 2: Tradie Detail View

**User Story:** As an Admin_User, I want to view the full details of a tradie profile submission including uploaded documents and images, so that I can make an informed approval decision.

#### Acceptance Criteria

1. WHEN the Admin_User clicks on a tradie row in the Data_Table, THE Tradie_Module SHALL open a Detail_Dialog displaying the complete tradie profile information
2. THE Detail_Dialog SHALL display the tradie's business name, ABN, ABN verification data, service description, website, categories, regions, operating hours, open days, and emergency availability status
3. THE Detail_Dialog SHALL display all uploaded business images in a scrollable gallery section
4. THE Detail_Dialog SHALL display the tradie's intro video URL when one has been provided
5. THE Detail_Dialog SHALL display the tradie's work photos in a grid layout
6. THE Detail_Dialog SHALL display the current Approval_Status and the submission date of the profile

### Requirement 3: Tradie Approval Workflow

**User Story:** As an Admin_User, I want to approve or reject tradie profile submissions, so that only verified tradies appear in customer-facing listings.

#### Acceptance Criteria

1. WHEN the Admin_User clicks the approve action on a pending tradie profile, THE Tradie_Module SHALL send an approval request to the Admin_API and update the Approval_Status to `approved`
2. WHEN the Admin_User clicks the reject action on a pending tradie profile, THE Tradie_Module SHALL prompt for a rejection reason, send a rejection request to the Admin_API, and update the Approval_Status to `rejected`
3. WHILE a tradie profile has Approval_Status of `pending`, THE Tradie_Module SHALL display both approve and reject action buttons in the Detail_Dialog and in the Data_Table row actions
4. WHILE a tradie profile has Approval_Status of `approved`, THE Tradie_Module SHALL display only a reject action button (to revoke approval)
5. WHILE a tradie profile has Approval_Status of `rejected`, THE Tradie_Module SHALL display only an approve action button (to grant approval)
6. WHEN an approval or rejection request succeeds, THE Tradie_Module SHALL display a success toast notification and refresh the tradie list
7. IF an approval or rejection request fails, THEN THE Tradie_Module SHALL display an error toast notification with the error message returned by the Admin_API

### Requirement 4: Tradie Bulk Actions

**User Story:** As an Admin_User, I want to approve or reject multiple tradie profiles at once, so that I can efficiently process large queues of pending submissions.

#### Acceptance Criteria

1. THE Tradie_Module SHALL provide row-level checkboxes in the Data_Table allowing the Admin_User to select multiple tradie profiles
2. WHEN one or more tradie profiles are selected, THE Tradie_Module SHALL display a bulk action toolbar with approve and reject buttons
3. WHEN the Admin_User clicks the bulk approve button, THE Tradie_Module SHALL send approval requests for all selected tradie profiles and display a summary toast notification with the count of successfully processed records
4. WHEN the Admin_User clicks the bulk reject button, THE Tradie_Module SHALL prompt for a rejection reason, send rejection requests for all selected tradie profiles, and display a summary toast notification
5. IF any individual request within a Bulk_Action fails, THEN THE Tradie_Module SHALL continue processing remaining records and display a toast notification indicating partial success with the count of failures

### Requirement 5: Review List View

**User Story:** As an Admin_User, I want to view a paginated list of all customer reviews with their moderation status, so that I can manage the review approval queue.

#### Acceptance Criteria

1. WHEN the Admin_User navigates to the reviews route, THE Review_Module SHALL display a Data_Table containing all customer reviews with columns for customer name, tradie business name, rating, comment preview, Approval_Status, and submission date
2. THE Review_Module SHALL display a Status_Badge for each review showing the current Approval_Status using distinct colors (amber for pending, green for approved, red for rejected)
3. WHEN the Admin_User selects a status filter, THE Review_Module SHALL display only reviews matching the selected Approval_Status
4. THE Review_Module SHALL paginate results with a configurable page size and display pagination controls below the Data_Table
5. WHEN the Admin_User types in the search field, THE Review_Module SHALL filter the review list by customer name or tradie business name matching the search term
6. THE Review_Module SHALL display the rating as a numeric value with a star indicator in the Data_Table

### Requirement 6: Review Detail View

**User Story:** As an Admin_User, I want to view the full details of a customer review, so that I can assess whether it meets content guidelines before approving.

#### Acceptance Criteria

1. WHEN the Admin_User clicks on a review row in the Data_Table, THE Review_Module SHALL open a Detail_Dialog displaying the complete review information
2. THE Detail_Dialog SHALL display the customer name, tradie business name, rating (with star visualization), full comment text, and submission date
3. THE Detail_Dialog SHALL display the current Approval_Status of the review
4. THE Detail_Dialog SHALL display a link or reference to the associated tradie profile for context

### Requirement 7: Review Approval Workflow

**User Story:** As an Admin_User, I want to approve or reject customer reviews, so that only appropriate reviews are visible to other customers.

#### Acceptance Criteria

1. WHEN the Admin_User clicks the approve action on a pending review, THE Review_Module SHALL send an approval request to the Admin_API and update the Approval_Status to `approved`
2. WHEN the Admin_User clicks the reject action on a pending review, THE Review_Module SHALL prompt for a rejection reason, send a rejection request to the Admin_API, and update the Approval_Status to `rejected`
3. WHILE a review has Approval_Status of `pending`, THE Review_Module SHALL display both approve and reject action buttons in the Detail_Dialog and in the Data_Table row actions
4. WHILE a review has Approval_Status of `approved`, THE Review_Module SHALL display only a reject action button (to revoke approval)
5. WHILE a review has Approval_Status of `rejected`, THE Review_Module SHALL display only an approve action button (to grant approval)
6. WHEN an approval or rejection request succeeds, THE Review_Module SHALL display a success toast notification and refresh the review list
7. IF an approval or rejection request fails, THEN THE Review_Module SHALL display an error toast notification with the error message returned by the Admin_API

### Requirement 8: Review Bulk Actions

**User Story:** As an Admin_User, I want to approve or reject multiple reviews at once, so that I can efficiently moderate large volumes of incoming reviews.

#### Acceptance Criteria

1. THE Review_Module SHALL provide row-level checkboxes in the Data_Table allowing the Admin_User to select multiple reviews
2. WHEN one or more reviews are selected, THE Review_Module SHALL display a bulk action toolbar with approve and reject buttons
3. WHEN the Admin_User clicks the bulk approve button, THE Review_Module SHALL send approval requests for all selected reviews and display a summary toast notification with the count of successfully processed records
4. WHEN the Admin_User clicks the bulk reject button, THE Review_Module SHALL prompt for a rejection reason, send rejection requests for all selected reviews, and display a summary toast notification
5. IF any individual request within a Bulk_Action fails, THEN THE Review_Module SHALL continue processing remaining records and display a toast notification indicating partial success with the count of failures

### Requirement 9: Backend Admin Tradies API

**User Story:** As a developer, I want admin-specific API endpoints for tradie moderation, so that the Admin_Panel can manage tradie approval workflows.

#### Acceptance Criteria

1. THE Admin_API SHALL expose a `GET /api/admin/tradies` endpoint that returns a paginated list of all tradie profiles with their Approval_Status, supporting query parameters for status filtering, search, page, and limit
2. THE Admin_API SHALL expose a `GET /api/admin/tradies/:id` endpoint that returns the full tradie profile details including business images, work photos, categories, regions, and user information
3. THE Admin_API SHALL expose a `PATCH /api/admin/tradies/:id/approve` endpoint that sets the tradie profile Approval_Status to `approved`
4. THE Admin_API SHALL expose a `PATCH /api/admin/tradies/:id/reject` endpoint that accepts a rejection reason in the request body and sets the tradie profile Approval_Status to `rejected`
5. THE Admin_API SHALL expose a `POST /api/admin/tradies/bulk-approve` endpoint that accepts an array of tradie profile IDs and sets their Approval_Status to `approved`
6. THE Admin_API SHALL expose a `POST /api/admin/tradies/bulk-reject` endpoint that accepts an array of tradie profile IDs and a rejection reason, and sets their Approval_Status to `rejected`
7. THE Admin_API SHALL require `authenticateAdmin` middleware on all tradie moderation endpoints

### Requirement 10: Backend Admin Reviews API

**User Story:** As a developer, I want admin-specific API endpoints for review moderation, so that the Admin_Panel can manage review approval workflows.

#### Acceptance Criteria

1. THE Admin_API SHALL expose a `GET /api/admin/reviews` endpoint that returns a paginated list of all reviews with their Approval_Status, customer name, tradie business name, rating, and comment, supporting query parameters for status filtering, search, page, and limit
2. THE Admin_API SHALL expose a `GET /api/admin/reviews/:id` endpoint that returns the full review details including customer information and associated tradie profile reference
3. THE Admin_API SHALL expose a `PATCH /api/admin/reviews/:id/approve` endpoint that sets the review Approval_Status to `approved`
4. THE Admin_API SHALL expose a `PATCH /api/admin/reviews/:id/reject` endpoint that accepts a rejection reason in the request body and sets the review Approval_Status to `rejected`
5. THE Admin_API SHALL expose a `POST /api/admin/reviews/bulk-approve` endpoint that accepts an array of review IDs and sets their Approval_Status to `approved`
6. THE Admin_API SHALL expose a `POST /api/admin/reviews/bulk-reject` endpoint that accepts an array of review IDs and a rejection reason, and sets their Approval_Status to `rejected`
7. THE Admin_API SHALL require `authenticateAdmin` middleware on all review moderation endpoints

### Requirement 11: Visibility Rules

**User Story:** As a platform operator, I want content to only be publicly visible after admin approval, so that the platform maintains quality and trust.

#### Acceptance Criteria

1. WHILE a tradie profile has Approval_Status of `pending` or `rejected`, THE Admin_API SHALL exclude the profile from all customer-facing listing endpoints
2. WHILE a review has Approval_Status of `pending` or `rejected`, THE Admin_API SHALL exclude the review from all customer-facing review endpoints
3. WHEN a tradie profile Approval_Status changes from `approved` to `rejected`, THE Admin_API SHALL immediately remove the profile from customer-facing listings
4. WHEN a review Approval_Status changes from `approved` to `rejected`, THE Admin_API SHALL immediately remove the review from customer-facing review listings

### Requirement 12: Admin Panel Integration

**User Story:** As an Admin_User, I want the tradies and reviews modules to integrate seamlessly with the existing admin panel navigation and layout, so that the experience is consistent across all modules.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display navigation entries for "Tradies" and "Reviews" in the sidebar when the corresponding feature flags are enabled
2. THE Admin_Panel SHALL render the Tradie_Module at the `/tradies` route and the Review_Module at the `/reviews` route using the existing lazy-loading and ProtectedRoute patterns
3. THE Tradie_Module and Review_Module SHALL follow the existing feature module file structure: `repository.ts`, `types.ts`, `schema.ts`, `hooks/`, `pages/`, `components/`, `index.ts`
4. THE Tradie_Module and Review_Module SHALL use the existing `ADMIN_PATHS.tradies` and `ADMIN_PATHS.reviews` path constants for API calls
5. THE Tradie_Module and Review_Module SHALL use React Query v5 for data fetching with appropriate cache invalidation on status changes
6. IF the Admin_API returns a validation error, THEN THE Tradie_Module and Review_Module SHALL display field-level error messages using the existing ApiError normalization pattern
