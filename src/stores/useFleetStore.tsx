import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import useFinanceStore from './useFinanceStore'

export interface Vehicle {
  id: string
  plate: string
  model: string
  brand: string
  year: number
  type: 'car' | 'motorcycle' | 'truck'
  fuel_type: 'gasoline' | 'ethanol' | 'diesel' | 'flex' | 'electric'
  status: 'active' | 'maintenance' | 'inactive'
  current_km: number
  purchase_date: string
  purchase_value: number
  contract_id?: string
}

export interface Driver {
  id: string
  name: string
  cpf: string
  cnh: string
  cnh_expiration: string
  category: string
  status: 'active' | 'inactive'
}

export interface VehicleAssignment {
  id: string
  vehicle_id: string
  driver_id: string
  start_date: string
  end_date?: string
}

export interface Maintenance {
  id: string
  vehicle_id: string
  type: 'Preventive' | 'Corrective'
  description: string
  date: string
  km: number
  cost: number
}

export interface Refueling {
  id: string
  vehicle_id: string
  driver_id: string
  liters: number
  value: number
  km: number
  date: string
  consumption?: number
}

interface FleetState {
  vehicles: Vehicle[]
  drivers: Driver[]
  assignments: VehicleAssignment[]
  maintenances: Maintenance[]
  refuelings: Refueling[]
  addVehicle: (v: Omit<Vehicle, 'id'>) => void
  updateVehicle: (id: string, v: Partial<Vehicle>) => void
  addDriver: (d: Omit<Driver, 'id'>) => void
  updateDriver: (id: string, d: Partial<Driver>) => void
  addAssignment: (a: Omit<VehicleAssignment, 'id'>) => void
  addMaintenance: (m: Omit<Maintenance, 'id'>) => void
  addRefueling: (r: Omit<Refueling, 'id' | 'consumption'>) => void
}

const FleetContext = createContext<FleetState | undefined>(undefined)

const today = new Date()
const formatD = (d: Date) => d.toISOString().split('T')[0]
const d0 = formatD(today)
const dPast1 = formatD(new Date(today.getTime() - 15 * 86400000))
const dPast2 = formatD(new Date(today.getTime() - 45 * 86400000))

export function FleetProvider({ children }: { children: ReactNode }) {
  const { addCost } = useFinanceStore()

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'v1',
      plate: 'ABC-1234',
      model: 'Fiorino',
      brand: 'Fiat',
      year: 2020,
      type: 'truck',
      fuel_type: 'flex',
      status: 'active',
      current_km: 45000,
      purchase_date: '2020-05-10',
      purchase_value: 65000,
      contract_id: '77777777-7777-7777-7777-777777777777',
    },
    {
      id: 'v2',
      plate: 'XYZ-9876',
      model: 'Gol',
      brand: 'VW',
      year: 2022,
      type: 'car',
      fuel_type: 'flex',
      status: 'active',
      current_km: 19800,
      purchase_date: '2022-01-20',
      purchase_value: 55000,
    },
  ])

  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 'd1',
      name: 'Carlos Silva',
      cpf: '111.222.333-44',
      cnh: '12345678901',
      cnh_expiration: formatD(new Date(today.getTime() + 300 * 86400000)),
      category: 'AD',
      status: 'active',
    },
    {
      id: 'd2',
      name: 'João Mendes',
      cpf: '222.333.444-55',
      cnh: '98765432109',
      cnh_expiration: dPast1,
      category: 'B',
      status: 'inactive',
    },
  ])

  const [assignments, setAssignments] = useState<VehicleAssignment[]>([
    {
      id: 'a1',
      vehicle_id: 'v1',
      driver_id: 'd1',
      start_date: dPast2,
    },
  ])

  const [maintenances, setMaintenances] = useState<Maintenance[]>([
    {
      id: 'm1',
      vehicle_id: 'v1',
      type: 'Preventive',
      description: 'Troca de óleo e filtros',
      date: dPast2,
      km: 40000,
      cost: 450,
    },
    {
      id: 'm2',
      vehicle_id: 'v2',
      type: 'Corrective',
      description: 'Troca de pastilhas de freio',
      date: dPast1,
      km: 19500,
      cost: 320,
    },
  ])

  const [refuelings, setRefuelings] = useState<Refueling[]>([
    {
      id: 'r1',
      vehicle_id: 'v1',
      driver_id: 'd1',
      liters: 40,
      value: 200,
      km: 44500,
      date: dPast2,
    },
    {
      id: 'r2',
      vehicle_id: 'v1',
      driver_id: 'd1',
      liters: 42,
      value: 210,
      km: 44920,
      date: dPast1,
      consumption: 10,
    },
  ])

  const addVehicle = useCallback((v: Omit<Vehicle, 'id'>) => {
    setVehicles((prev) => [...prev, { ...v, id: Math.random().toString() }])
  }, [])

  const updateVehicle = useCallback((id: string, v: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((x) => (x.id === id ? { ...x, ...v } : x)))
  }, [])

  const addDriver = useCallback((d: Omit<Driver, 'id'>) => {
    setDrivers((prev) => [...prev, { ...d, id: Math.random().toString() }])
  }, [])

  const updateDriver = useCallback((id: string, d: Partial<Driver>) => {
    setDrivers((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x)))
  }, [])

  const addAssignment = useCallback((a: Omit<VehicleAssignment, 'id'>) => {
    setAssignments((prev) => {
      // close previous active assignment for this vehicle
      const updated = prev.map((x) =>
        x.vehicle_id === a.vehicle_id && !x.end_date ? { ...x, end_date: a.start_date } : x,
      )
      return [...updated, { ...a, id: Math.random().toString() }]
    })
  }, [])

  const addMaintenance = useCallback(
    (m: Omit<Maintenance, 'id'>) => {
      const newM = { ...m, id: Math.random().toString() }
      setMaintenances((prev) => [...prev, newM])

      const v = vehicles.find((x) => x.id === m.vehicle_id)
      if (v) {
        if (m.km > v.current_km) {
          setVehicles((prev) => prev.map((x) => (x.id === v.id ? { ...x, current_km: m.km } : x)))
        }
        if (v.contract_id) {
          addCost({
            contractId: v.contract_id,
            category: 'equipamento',
            value: m.cost,
            date: m.date,
            description: `Manutenção ${m.type} - Veículo ${v.plate}: ${m.description}`,
            origin: 'manual',
          })
        }
      }
    },
    [vehicles, addCost],
  )

  const addRefueling = useCallback(
    (r: Omit<Refueling, 'id' | 'consumption'>) => {
      let consumption: number | undefined = undefined

      setRefuelings((prev) => {
        const vehicleRefuels = prev
          .filter((x) => x.vehicle_id === r.vehicle_id)
          .sort((a, b) => a.km - b.km)

        if (vehicleRefuels.length > 0) {
          const last = vehicleRefuels[vehicleRefuels.length - 1]
          if (r.km > last.km && r.liters > 0) {
            consumption = (r.km - last.km) / r.liters
          }
        }

        return [...prev, { ...r, id: Math.random().toString(), consumption }]
      })

      const v = vehicles.find((x) => x.id === r.vehicle_id)
      if (v) {
        if (r.km > v.current_km) {
          setVehicles((prev) => prev.map((x) => (x.id === v.id ? { ...x, current_km: r.km } : x)))
        }
        if (v.contract_id) {
          addCost({
            contractId: v.contract_id,
            category: 'combustível',
            value: r.value,
            date: r.date,
            description: `Abastecimento - Veículo ${v.plate}`,
            origin: 'manual',
          })
        }
      }
    },
    [vehicles, addCost],
  )

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        assignments,
        maintenances,
        refuelings,
        addVehicle,
        updateVehicle,
        addDriver,
        updateDriver,
        addAssignment,
        addMaintenance,
        addRefueling,
      }}
    >
      {children}
    </FleetContext.Provider>
  )
}

export default function useFleetStore() {
  const context = useContext(FleetContext)
  if (!context) throw new Error('useFleetStore must be used within a FleetProvider')
  return context
}
