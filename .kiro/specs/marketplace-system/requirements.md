# Requirements Document

## Introduction

This document outlines the requirements for implementing a comprehensive marketplace system with role-based authentication, product management, cart functionality, order processing, and discount system. The system will support two primary user roles: Farmers (sellers) and Consumers (buyers), with secure authentication via NextAuth.js and data persistence through Prisma with PostgreSQL.

## Requirements

### Requirement 1

**User Story:** As a user, I want to authenticate using NextAuth.js with role-based access control, so that I can access features appropriate to my role (Farmer or Consumer).

#### Acceptance Criteria

1. WHEN a new user signs up THEN the system SHALL assign CONSUMER as the default role
2. WHEN a user authenticates THEN the system SHALL include role information in the NextAuth session and JWT token
3. WHEN a logged-in CONSUMER requests to become a FARMER THEN the system SHALL provide an upgrade endpoint at /api/seller/become
4. IF a user is not authenticated THEN the system SHALL redirect them to the login page for protected routes
5. WHEN accessing role-protected routes THEN the system SHALL validate the user's role and deny access if unauthorized

### Requirement 2

**User Story:** As a system administrator, I want to implement route protection based on user roles, so that only authorized users can access specific functionality.

#### Acceptance Criteria

1. WHEN a user accesses /sell/** routes THEN the system SHALL only allow FARMER role access
2. WHEN a user accesses /cart/**, /checkout/**, or /orders/** routes THEN the system SHALL allow any authenticated user
3. IF an unauthorized user attempts to access protected routes THEN the system SHALL redirect them or throw an authorization error
4. WHEN middleware processes a request THEN the system SHALL check the user's session and role before allowing access

### Requirement 3

**User Story:** As a farmer, I want to create, edit, and manage products in the marketplace, so that I can sell my agricultural products to consumers.

#### Acceptance Criteria

1. WHEN a farmer creates a product THEN the system SHALL store title, slug, description, priceCents, currency, images, category, and sellerId
2. WHEN a farmer updates a product THEN the system SHALL allow modification of product details and inventory quantity
3. WHEN a farmer accesses the seller dashboard at /sell THEN the system SHALL display their products with CRUD actions
4. IF a non-farmer user attempts to create/edit products THEN the system SHALL deny access
5. WHEN a product is created THEN the system SHALL generate a unique slug for URL routing

### Requirement 4

**User Story:** As a consumer, I want to browse and search products in the marketplace, so that I can find agricultural products to purchase.

#### Acceptance Criteria

1. WHEN a user visits /marketplace THEN the system SHALL display a grid of available products
2. WHEN a user searches for products THEN the system SHALL filter results by search term, category, and price range
3. WHEN a user clicks on a product THEN the system SHALL navigate to /product/[slug] with detailed product information
4. WHEN viewing product details THEN the system SHALL display an "Add to Cart" button for authenticated users
5. WHEN products are listed THEN the system SHALL show only products with available inventory

### Requirement 5

**User Story:** As a consumer, I want to add products to my cart and manage cart items, so that I can prepare for checkout.

#### Acceptance Criteria

1. WHEN a consumer adds a product to cart THEN the system SHALL snapshot the current unit price at add time
2. WHEN a consumer views their cart at /cart THEN the system SHALL display cart items, subtotal, discount, and total
3. WHEN a consumer updates cart quantities THEN the system SHALL recalculate totals in real-time
4. WHEN a consumer removes items from cart THEN the system SHALL update the cart and totals accordingly
5. WHEN accessing cart functionality THEN the system SHALL require user authentication

### Requirement 6

**User Story:** As a consumer, I want to complete the checkout process, so that I can purchase products from farmers.

#### Acceptance Criteria

1. WHEN a consumer initiates checkout THEN the system SHALL validate inventory availability in a Prisma transaction
2. WHEN checkout is successful THEN the system SHALL create Order and OrderItem records
3. WHEN an order is created THEN the system SHALL decrement product inventory quantities safely
4. WHEN checkout completes THEN the system SHALL clear the user's cart
5. IF inventory is insufficient during checkout THEN the system SHALL prevent the order and notify the user

### Requirement 7

**User Story:** As a consumer, I want to view my order history, so that I can track my purchases and their status.

#### Acceptance Criteria

1. WHEN a consumer visits /orders THEN the system SHALL display their complete order history
2. WHEN viewing orders THEN the system SHALL show order date, items, quantities, prices, and total amount
3. WHEN an order is displayed THEN the system SHALL include seller information for each item
4. IF a consumer has no orders THEN the system SHALL display an appropriate empty state message
5. WHEN orders are listed THEN the system SHALL sort them by creation date (newest first)

### Requirement 8

**User Story:** As a farmer, I want to view orders for my products, so that I can fulfill customer purchases.

#### Acceptance Criteria

1. WHEN a farmer accesses their seller dashboard THEN the system SHALL display orders containing their products
2. WHEN viewing orders THEN the system SHALL show customer information, order details, and quantities
3. WHEN orders are displayed THEN the system SHALL group them by order date and customer
4. WHEN a farmer views order details THEN the system SHALL show only the items that belong to their products
5. IF a farmer has no orders THEN the system SHALL display an appropriate empty state message

### Requirement 9

**User Story:** As a consumer, I want to apply discount codes to my cart, so that I can receive price reductions on my purchases.

#### Acceptance Criteria

1. WHEN a consumer enters a discount code THEN the system SHALL validate the code via /api/discounts/validate
2. WHEN a discount is valid THEN the system SHALL apply it to the cart and update the total
3. WHEN a discount is applied THEN the system SHALL enforce only one discount per cart (no stacking)
4. IF a discount code is invalid THEN the system SHALL display appropriate error messages with reasons
5. WHEN checkout occurs with a discount THEN the system SHALL record a DiscountUse entry

### Requirement 10

**User Story:** As a system administrator, I want to manage discount codes with comprehensive validation rules, so that discounts are applied correctly and fairly.

#### Acceptance Criteria

1. WHEN validating a discount THEN the system SHALL check if it's active and within the date range
2. WHEN applying a discount THEN the system SHALL verify the user's role matches allowedRoles or ANY
3. WHEN a discount is used THEN the system SHALL ensure global maxUses and per-user limits are not exceeded
4. WHEN calculating discounts THEN the system SHALL verify the cart meets minSubtotalCents requirement
5. WHEN a discount validation fails THEN the system SHALL return specific reasons for the failure

### Requirement 11

**User Story:** As a developer, I want utility functions for authentication and authorization, so that role-based access control is consistently implemented across the application.

#### Acceptance Criteria

1. WHEN getCurrentUser() is called THEN the system SHALL return { id, email, role } for the active session
2. WHEN requireRole() is called THEN the system SHALL check the user's role and throw/redirect if unauthorized
3. WHEN NextAuth callbacks are executed THEN the system SHALL include role information in session and JWT
4. WHEN authentication is configured THEN the system SHALL support both credentials and OAuth providers
5. WHEN session management occurs THEN the system SHALL use Prisma adapter for data persistence

### Requirement 12

**User Story:** As a developer, I want utility functions for discount calculations and money formatting, so that pricing is handled consistently throughout the application.

#### Acceptance Criteria

1. WHEN discount calculations are performed THEN the system SHALL use lib/discounts.ts for validation and calculation logic
2. WHEN monetary values are displayed THEN the system SHALL use lib/money.ts to format amounts in INR
3. WHEN prices are stored THEN the system SHALL use priceCents to avoid floating-point precision issues
4. WHEN discounts are calculated THEN the system SHALL handle both PERCENT and FIXED discount types
5. WHEN currency formatting occurs THEN the system SHALL display appropriate currency symbols and decimal places