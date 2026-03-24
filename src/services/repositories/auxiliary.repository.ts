import { createRepository } from './core/base.repository'
import type { Vehicle, CreateVehicleDTO, UpdateVehicleDTO } from './types/resources'
import type { Photo, CreatePhotoDTO, UpdatePhotoDTO } from './types/quality'
import type { Audit, CreateAuditDTO, Log, CreateLogDTO } from './types/traceability'

export const VehiclesRepository = createRepository<Vehicle, CreateVehicleDTO, UpdateVehicleDTO>(
  'vehicles',
  [],
)
export const PhotosRepository = createRepository<Photo, CreatePhotoDTO, UpdatePhotoDTO>(
  'photos',
  [],
)
export const AuditsRepository = createRepository<Audit, CreateAuditDTO, Partial<CreateAuditDTO>>(
  'audits',
  [],
)
export const LogsRepository = createRepository<Log, CreateLogDTO, Partial<CreateLogDTO>>('logs', [])
