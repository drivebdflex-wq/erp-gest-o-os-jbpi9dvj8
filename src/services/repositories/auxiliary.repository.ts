import { createRepository } from './core/base.repository'
import type { Vehicle, CreateVehicleDTO, UpdateVehicleDTO } from './types/resources'
import type { Photo, CreatePhotoDTO, UpdatePhotoDTO } from './types/quality'
import type { Audit, CreateAuditDTO, Log, CreateLogDTO } from './types/traceability'
import { isMock, supabase } from '@/lib/supabase'

export const VehiclesRepository = createRepository<Vehicle, CreateVehicleDTO, UpdateVehicleDTO>(
  'vehicles',
  [],
)

const basePhotosRepository = createRepository<Photo, CreatePhotoDTO, UpdatePhotoDTO>('photos', [])

export const PhotosRepository = {
  ...basePhotosRepository,
  async findByServiceOrderId(serviceOrderId: string): Promise<Photo[]> {
    if (isMock) {
      const all = await basePhotosRepository.findAll()
      return all.filter((p) => p.service_order_id === serviceOrderId)
    }
    return supabase.request<Photo[]>(`photos?service_order_id=eq.${serviceOrderId}&select=*`)
  },
}

export const AuditsRepository = createRepository<Audit, CreateAuditDTO, Partial<CreateAuditDTO>>(
  'audits',
  [],
)
export const LogsRepository = createRepository<Log, CreateLogDTO, Partial<CreateLogDTO>>('logs', [])
