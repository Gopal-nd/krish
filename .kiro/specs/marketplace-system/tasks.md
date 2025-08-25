# Implementation Plan

- [ ] 1. Update Prisma schema for farming equipment marketplace
  - Add UserRole enum (CONSUMER, FARMER) to User model with default CONSUMER
  - Create Equipment model with fields: title, slug, description, images, category, condition, location, sellerId
  - Create EquipmentInquiry model to track buyer interest and WhatsApp interactions
  - Add WhatsApp contact information to User model
  - _Requirements: 1.1, 3.1_

- [ ] 2. Extend NextAuth configuration for role-based authentication
  - Update JWT callback to include user role from database
  - Update session callback to include role in session object
  - Create getCurrentUser() helper function returning { id, email, role }
  - Create requireRole() utility for role-based access control
  - _Requirements: 1.2, 1.3, 11.1, 11.2, 11.5_

- [ ] 3. Create authentication utilities and middleware
  - Implement RBAC middleware for route protection
  - Create role guard component for client-side protection
  - Add server action for CONSUMER to FARMER role upgrade at /api/seller/become
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 11.3_

- [ ] 4. Implement WhatsApp integration utilities
  - Create lib/whatsapp.ts for WhatsApp API integration
  - Add utility functions for generating WhatsApp chat links
  - Create message templates for equipment inquiries
  - Update lib/db.ts to ensure Prisma client singleton pattern
  - _Requirements: New WhatsApp integration requirement_

- [ ] 5. Create equipment management API routes
  - Implement POST /api/equipment for equipment listing creation (FARMER only)
  - Implement GET /api/equipment with search, category, condition, and location filtering
  - Implement GET /api/equipment/[slug] for equipment details
  - Implement PATCH /api/equipment/[id] for equipment updates (FARMER only)
  - _Requirements: 3.2, 3.4, 4.2, 4.5_

- [ ] 6. Implement inquiry and WhatsApp communication system
  - Create POST /api/equipment/[id]/inquire for recording buyer interest
  - Create GET /api/inquiries for farmers to view equipment inquiries
  - Implement WhatsApp link generation for direct seller-buyer communication
  - Add inquiry tracking and management functionality
  - _Requirements: New inquiry tracking requirement_

- [ ] 7. Build equipment search and filtering system
  - Implement advanced search with equipment name, category, and location
  - Add filtering by equipment condition (new, used, refurbished)
  - Create location-based search functionality
  - Add sorting options (newest, price range if provided)
  - _Requirements: 4.2, 4.5_

- [ ] 8. Create inquiry management for sellers
  - Implement GET /api/inquiries/seller for farmer inquiry management
  - Add inquiry status tracking (new, contacted, closed)
  - Create inquiry response templates and management
  - Build inquiry analytics for sellers
  - _Requirements: 8.1, 8.2_

- [ ] 9. Create equipment marketplace UI pages and components
  - Build /equipment page with equipment grid and filtering
  - Create EquipmentCard component for equipment display with WhatsApp contact button
  - Implement EquipmentFilters component for search, category, condition, and location filtering
  - Add equipment search functionality with real-time filtering
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10. Implement equipment details and WhatsApp integration
  - Create /equipment/[slug] page with detailed equipment information
  - Build "Contact Seller" functionality that opens WhatsApp chat
  - Implement inquiry tracking when users contact sellers
  - Add equipment condition and location display on equipment pages
  - _Requirements: 4.3, 4.4, WhatsApp integration_

- [ ] 11. Build inquiry management UI for buyers
  - Create /inquiries page for buyers to track their equipment inquiries
  - Implement InquiryCard component showing inquiry status and seller contact
  - Add inquiry history with WhatsApp conversation links
  - Build inquiry status updates (contacted, in discussion, closed)
  - _Requirements: New inquiry management requirement_

- [ ] 12. Create seller dashboard and equipment management
  - Build /sell dashboard page with navigation to equipment and inquiries
  - Create /sell/equipment page with equipment management table
  - Implement EquipmentForm component for creating and editing equipment listings
  - Add /sell/inquiries page showing inquiries for seller's equipment
  - _Requirements: 3.3, 8.1, 8.3, 8.4_

- [ ] 13. Implement WhatsApp communication features
  - Create WhatsApp message templates for different equipment categories
  - Build inquiry response system with pre-filled WhatsApp messages
  - Add WhatsApp Business API integration for automated responses
  - Implement inquiry status tracking based on WhatsApp interactions
  - _Requirements: WhatsApp integration requirement_

- [ ] 14. Add role-based navigation and UI protection
  - Update navigation components to show role-appropriate menu items
  - Implement RoleGuard component for protecting UI sections
  - Add role-based redirects after authentication
  - Create role upgrade UI for CONSUMER to FARMER transition
  - _Requirements: 2.1, 2.2, 1.3_

- [ ] 15. Create database seed script with sample data
  - Create seed script with one FARMER and one CONSUMER user with WhatsApp numbers
  - Add sample equipment listings across different categories (tractors, harvesters, tools)
  - Include sample inquiries and WhatsApp interaction data for testing
  - Add equipment in different conditions and locations
  - _Requirements: Sample data requirement_

- [ ] 16. Implement comprehensive error handling
  - Add consistent error response formatting across all API routes
  - Implement client-side error handling with toast notifications
  - Add form validation and error display for all user inputs
  - Create error boundaries for React components
  - _Requirements: Error handling requirement_

- [ ] 17. Add authentication and authorization tests
  - Write unit tests for getCurrentUser() and requireRole() utilities
  - Test NextAuth callbacks for role inclusion in session and JWT
  - Create integration tests for role-based route protection
  - Test CONSUMER to FARMER role upgrade functionality
  - _Requirements: 1.2, 1.3, 11.1, 11.2_

- [ ] 18. Create equipment management tests
  - Write unit tests for equipment CRUD operations
  - Test equipment filtering and search functionality
  - Create integration tests for equipment API routes with role-based access
  - Test WhatsApp link generation and inquiry tracking
  - _Requirements: 3.2, 3.4, 4.2, WhatsApp integration_

- [ ] 19. Implement inquiry and WhatsApp integration tests
  - Write unit tests for inquiry creation and management
  - Test WhatsApp message template generation
  - Create integration tests for inquiry API routes
  - Test inquiry status tracking and seller notification system
  - _Requirements: Inquiry management and WhatsApp integration_

- [ ] 20. Create end-to-end user journey tests
  - Test complete buyer journey from equipment browse to WhatsApp contact
  - Test seller journey from equipment listing to inquiry management
  - Create tests for role-based access control across all features
  - Test WhatsApp integration and inquiry tracking workflows
  - _Requirements: Complete user journey testing_