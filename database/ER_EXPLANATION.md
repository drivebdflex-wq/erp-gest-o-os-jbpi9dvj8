# Entity Relationships (ER) Explanation

## 1. Core Access Control

- **`users`**: Contains system access credentials and profile data.
- **`roles`**: Defines system access levels (e.g., Administrator, Technician).
- **`user_roles`**: Pivot table handling the Many-to-Many (N:N) relationship between users and roles, allowing users to have multiple access contexts.

## 2. Operational Management

- **`teams`**: Represents operational groups or squads. The `supervisor_id` references `users(id)` to identify the team's manager.
- **`technicians`**: Specialized field agents, referencing `users(id)` for their identity. Links to a team via `team_id` (1:N relationship).

## 3. Client & Contract Infrastructure

- **`clients`**: Stores customer entities and organizational details with a unique CNPJ/CPF document structure.
- **`contracts`**: Defines the commercial agreements. The `client_id` references `clients(id)` (1:N). Deleting a client cascades and removes their contracts.

## 4. Service Order Lifecycle

- **`service_orders`**: The central operational entity linking the client (`client_id`) and assigned executor (`technician_id`). An audit trigger automatically monitors and logs status transitions over time.

## 5. Resource Management

- **`materials`**: Global catalog of items, tools, and equipment identified by a unique SKU.
- **`inventory`**: Tracks stock quantities at various locations. `material_id` references `materials(id)` (1:N).
- **`service_order_materials`**: Join table mapping the N:N relationship between `service_orders` and `materials` to track consumption and parts used per work order.
- **`vehicles`**: Represents the fleet. Vehicles are assigned to field agents via the `technician_id` mapping.

## 6. Quality & Compliance

- **`checklists`**: Parent entity for dynamic inspection form templates.
- **`checklist_items`**: Questions or steps inside a template. `checklist_id` references `checklists(id)` (1:N).
- **`photos`**: Stores evidence for completed tasks. Uses a polymorphic relationship (`related_entity_type` and `related_entity_id`) to attach photos flexibly to either Service Orders or Checklists.

## 7. Traceability

- **`audits`**: Captures changes at the database level. Specifically populated via triggers for events like status updates on Service Orders.
- **`logs`**: System-wide structured application logging for tracking errors, warnings, and contextual info.
