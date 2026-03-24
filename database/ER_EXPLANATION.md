# Entity Relationships (ER) Explanation

## 1. Core Access Control

- **`roles`**: Defines system access levels (e.g., Admin, Technician, Auditor).
- **`users`**: Contains system access credentials and profile data. The `role_id` is a Foreign Key referencing `roles(id)` to enforce Role-Based Access Control (RBAC).

## 2. Client & Contract Infrastructure

- **`clients`**: Stores customer entities and organizational details.
- **`contracts`**: Defines the commercial agreements. The `client_id` is a Foreign Key referencing `clients(id)`. Deleting a client cascades and removes their contracts.

## 3. Operational Management

- **`teams`**: Represents operational groups. The `supervisor_id` references `users(id)` to identify the team's manager.
- **`technicians`**: Specialized field agents. It links a system login (`user_id` referencing `users(id)`) to an operational unit (`team_id` referencing `teams(id)`).

## 4. Service Order Lifecycle

- **`service_orders`**: The central operational entity. It connects multiple dimensions:
  - The customer (`client_id` referencing `clients(id)`).
  - The commercial agreement (`contract_id` referencing `contracts(id)`).
  - The assigned executor (`technician_id` referencing `technicians(id)`).

## 5. Resource Management

- **`materials`**: Global catalog of items, tools, and equipment.
- **`inventory`**: Tracks stock quantities. The `material_id` references `materials(id)`.
- **`vehicles`**: Represents the fleet. Vehicles are assigned to field agents via `technician_id` referencing `technicians(id)`.

## 6. Quality & Compliance

- **`checklists`**: Parent entity for dynamic form templates.
- **`checklist_items`**: Questions or steps inside a template. `checklist_id` references `checklists(id)`.
- **`photos`**: Stores evidence for completed tasks. `service_order_id` references `service_orders(id)`.
- **`audits`**: Evaluates completed service orders. It ties the order (`service_order_id` referencing `service_orders(id)`) to the reviewer (`auditor_id` referencing `users(id)`).

## 7. Traceability

- **`logs`**: Tracks all system events and data changes for auditing purposes. `user_id` references `users(id)` to show who performed the action, while `table_name` and `record_id` logically map back to any modified entity.
