# Submission 3: Design Document - Smart Parking IoT System

## Overview
This submission contains the design documentation for the Smart Parking IoT system, including architectural views, class diagrams, and implementation details.

## Required Components

### 1. Deployment View
- **Database:** Railway MongoDB (managed MongoDB service)
- **Backend:** Railway (Node.js hosting platform)
- **Frontend:** Vercel (static site hosting)
- **IoT Integration:** MQTT gateway (currently mockup, planned for future implementation)
- **Business Flows:** Include billing/payment flows, authentication flows

### 2. Development/Implementation View
- Layered architecture (Controllers → Services → Models)
- Technology stack details
- Package/component organization
- Data flow diagrams

### 3. Class Diagram
- Complete class diagram with 23 classes
- Method descriptions grouped by class
- Draw.io diagram embed

### 4. Test Cases (Bonus)
- Unit tests for backend services
- Unit tests for frontend components
- Integration test scenarios

## LaTeX Structure Plan

```
main.tex (main document)
├── sections/
│   ├── 1-deployment-view.tex
│   ├── 2-development-view.tex
│   ├── 3-class-diagram.tex
│   ├── 4-method-descriptions.tex
│   ├── 5-test-cases.tex
│   └── contribution.tex
├── figures/
│   ├── deployment/
│   ├── development/
│   ├── class-diagram/
│   └── test-cases/
├── assets/
└── mockups/
```

## Implementation Plan

### Phase 1: Deployment View ✅ COMPLETED
- [x] Create deployment architecture diagram
- [x] Document Railway MongoDB setup
- [x] Document Vercel frontend deployment
- [x] Document Railway backend deployment
- [x] Include IoT MQTT gateway architecture
- [x] Add business flow diagrams (authentication, billing)

### Phase 2: Development View ✅ COMPLETED
- [x] Create layered architecture diagram
- [x] Document technology stack
- [x] Show package structure
- [x] Include data flow diagrams
- [x] Component relationship diagrams

### Phase 3: Class Diagram & Methods ✅ COMPLETED
- [ ] Export Draw.io diagram as PDF/PNG and place in `figures/class-diagram/`
- [x] Create method description tables
- [x] Group descriptions by class
- [x] Add brief summaries for each method

### Phase 4: Test Cases ✅ COMPLETED
- [x] Document existing Jest/Vitest tests
- [x] Create test case tables
- [x] Include unit test scenarios
- [x] Add integration test cases

### Phase 5: Final Compilation
- [ ] Compile all sections
- [ ] Add team contribution section
- [ ] Generate final PDF
- [ ] Review and validate all diagrams

## Technology Stack Reference

### Backend
- Node.js + Express 5 + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Pino Logging
- Swagger API Documentation

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS v4 + Radix UI
- React Router + Recharts
- Vitest for testing

### Infrastructure
- Docker containers
- Railway (backend + MongoDB)
- Vercel (frontend)
- MQTT (IoT gateway - planned)

## File Organization
- `sections/`: Individual LaTeX sections
- `figures/`: All diagrams and images
- `assets/`: Logos and static assets
- `mockups/`: UI mockups if needed