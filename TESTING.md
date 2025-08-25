# Testing Guide

This guide covers the comprehensive testing strategy for the Krishi Equipment Marketplace.

## 🧪 Test Structure

### Unit Tests (`src/__tests__/unit/`)
- **auth.test.ts**: Authentication and authorization utilities
- **errors.test.ts**: Error handling system
- **whatsapp.test.ts**: WhatsApp utilities and templates
- **components.test.tsx**: React components testing

### Integration Tests (`src/__tests__/integration/`)
- **equipment-api.test.ts**: Equipment API endpoints
- **inquiry-api.test.ts**: Inquiry system APIs

### End-to-End Tests (`src/__tests__/e2e/`)
- **marketplace.spec.ts**: Complete user journey tests

## 🚀 Running Tests

### Unit and Integration Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### End-to-End Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run all tests (unit + E2E)
npm run test:all
```

## 📊 Test Coverage

### Current Coverage Areas

#### Authentication & Authorization ✅
- User authentication flow
- Role-based access control
- Session management
- Route protection
- Role upgrade functionality

#### Equipment Management ✅
- CRUD operations
- Search and filtering
- Image handling
- Validation
- Error handling

#### WhatsApp Integration ✅
- Message templates
- Phone number validation
- Link generation
- Business API integration
- Automated responses

#### Component Testing ✅
- Form validation
- Navigation components
- Error boundaries
- Loading states

#### End-to-End Testing ✅
- User journeys
- Role-based access
- Form interactions
- API integrations

## 🛠️ Testing Tools

### Jest + React Testing Library
- **Framework**: Jest for test runner
- **Components**: React Testing Library for component testing
- **Assertions**: Built-in Jest matchers + RTL custom matchers
- **Coverage**: Istanbul for code coverage reports

### Playwright
- **Framework**: Playwright for E2E testing
- **Browsers**: Chromium, Firefox, WebKit
- **Features**: Auto-waiting, screenshots, videos, tracing

### Testing Library Ecosystem
- **User Events**: For user interaction testing
- **Jest DOM**: Additional DOM matchers
- **MSW**: API mocking (future enhancement)

## 📝 Writing Tests

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react'
import { EquipmentCard } from '@/components/marketplace/EquipmentCard'

describe('EquipmentCard', () => {
  it('should render equipment information', () => {
    const equipment = {
      id: '1',
      title: 'Test Tractor',
      priceCents: 10000000,
      currency: 'INR',
      location: 'Punjab, India'
    }

    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByText('Test Tractor')).toBeInTheDocument()
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument()
  })
})
```

### Integration Test Example
```typescript
import { GET } from '@/app/api/equipment/route'

describe('Equipment API', () => {
  it('should return equipment list', async () => {
    const request = new Request('http://localhost:3000/api/equipment')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.equipment).toBeDefined()
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should browse equipment', async ({ page }) => {
  await page.goto('/equipment')

  await expect(page.getByText('Browse Equipment')).toBeVisible()

  // Interact with filters
  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByLabel('Category').selectOption('Tractor')

  // Check results
  await expect(page.getByText('Tractor')).toBeVisible()
})
```

## 🏗️ Test Environment Setup

### Prerequisites
1. Node.js 18+ installed
2. Database running (PostgreSQL)
3. Environment variables configured

### Setup Steps
```bash
# Install dependencies
npm install

# Setup database
npm run db:reset

# Install Playwright browsers
npx playwright install

# Run tests
npm test
```

## 🔍 Test Categories

### 1. Authentication Tests
- ✅ Login/logout flow
- ✅ Session management
- ✅ Role-based access
- ✅ Password validation
- ✅ Token handling

### 2. Equipment Management Tests
- ✅ Create equipment (farmers only)
- ✅ Update equipment (owner only)
- ✅ Delete equipment
- ✅ Search and filter
- ✅ Image upload validation

### 3. WhatsApp Integration Tests
- ✅ Message template generation
- ✅ Phone number validation
- ✅ WhatsApp link creation
- ✅ Business API integration
- ✅ Automated responses

### 4. Form Validation Tests
- ✅ Required field validation
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Custom validation rules
- ✅ Error display

### 5. API Integration Tests
- ✅ HTTP status codes
- ✅ Request/response validation
- ✅ Error handling
- ✅ Authentication middleware
- ✅ Database operations

### 6. Component Tests
- ✅ Rendering and props
- ✅ User interactions
- ✅ State management
- ✅ Error boundaries
- ✅ Accessibility

### 7. End-to-End Tests
- ✅ User registration/login
- ✅ Equipment browsing
- ✅ Inquiry creation
- ✅ WhatsApp integration
- ✅ Seller dashboard
- ✅ Role-based access control

## 🎯 Test Data Strategy

### Sample Data
- **Users**: 4 sample users (2 farmers, 2 consumers)
- **Equipment**: 8 equipment listings across categories
- **Inquiries**: 5 sample inquiries with different statuses
- **Categories**: Tractor, Harvester, Tiller, Irrigation, etc.

### Test Data Generation
```bash
# Generate fresh sample data
npm run db:seed

# Reset and seed
npm run db:reset
```

## 📈 Code Coverage

### Target Coverage
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 85%+
- **Lines**: 80%+

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## 🔧 Debugging Tests

### Debug Unit Tests
```bash
# Run specific test
npm test -- --testNamePattern="EquipmentCard"

# Debug with VSCode
# Add debugger statement in test
```

### Debug E2E Tests
```bash
# Run in debug mode
npm run test:e2e -- --debug

# Run with UI
npm run test:e2e:ui

# Generate trace
npm run test:e2e -- --trace on
```

## 🚨 Common Issues & Solutions

### 1. Database Connection Issues
```bash
# Check database status
npm run db:studio

# Reset database
npm run db:reset
```

### 2. Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Update database URL
DATABASE_URL="postgresql://localhost:5432/krishi_test"
```

### 3. Test Timeouts
```typescript
// Increase timeout for async operations
test('slow operation', async () => {
  test.setTimeout(10000) // 10 seconds
  // test code
})
```

### 4. Playwright Browser Issues
```bash
# Reinstall browsers
npx playwright install --force

# Check browser installation
npx playwright install-deps
```

## 📋 Test Checklist

### Before Committing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (CI)
- [ ] Code coverage meets targets
- [ ] No console errors
- [ ] Accessibility tests pass

### Before Deployment
- [ ] Full test suite passes
- [ ] E2E tests run against staging
- [ ] Performance tests pass
- [ ] Security tests pass

## 🔄 Continuous Integration

### GitHub Actions Workflow
- **Unit Tests**: Run on every push/PR
- **Integration Tests**: Run on push to main
- **E2E Tests**: Run on push to main
- **Coverage Reports**: Upload to Codecov

### Local CI Simulation
```bash
# Run all tests like CI
npm run test:all

# Check code quality
npm run lint
```

## 📚 Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies
- Use realistic test data
- Avoid over-mocking

### 3. Test Data Management
- Use factories for test data
- Clean up after tests
- Avoid test data conflicts

### 4. Performance Considerations
- Keep tests fast and focused
- Use appropriate test types
- Parallel test execution

### 5. Accessibility Testing
- Test keyboard navigation
- Check screen reader compatibility
- Validate color contrast

## 🎓 Advanced Testing Features

### Custom Matchers
```typescript
// Add to jest.setup.js
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    return {
      message: () => `expected ${received} to be a valid email`,
      pass
    }
  }
})
```

### API Testing Helpers
```typescript
// Test utilities for API testing
export const createAuthenticatedRequest = (user: User, body?: any) => {
  return new Request('/api/test', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })
}
```

This testing guide ensures comprehensive coverage of all application features with automated testing strategies for reliable deployment.
