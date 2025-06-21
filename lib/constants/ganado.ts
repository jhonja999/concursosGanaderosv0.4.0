// Constantes para el sistema de ganado

export const CATEGORIAS_GANADO = [
  { value: 'A_DIENTES_LECHE', label: 'A - Dientes de Leche' },
  { value: 'ADULTO_SENIOR', label: 'Adulto o Senior (desde 2 años adelante)' },
  { value: 'B_DOS_DIENTES_SIN_PARIR', label: 'B - Dos Dientes (Sin haber parido)' },
  { value: 'C_DOS_DIENTES_LACTACION', label: 'C - Dos Dientes Lactación' },
  { value: 'D_CUATRO_DIENTES_LACTACION', label: 'D - Cuatro Dientes Lactación' },
  { value: 'E_SEIS_DIENTES_LACTACION', label: 'E - Seis Dientes Lactación' },
  { value: 'F_BOCA_LLENA_LACTACION', label: 'F - Boca Llena en Lactación' },
  { value: 'G_SECA_UNICA', label: 'G - Seca (haber parido) Única' },
  { value: 'JOVEN_JUNIOR', label: 'Joven o Junior (1 año mayor)' },
  { value: 'TERNERA_1_ANO_INTERMEDIA', label: 'Ternera 1 año intermedia' },
  { value: 'TERNERA_1_ANO_MAYOR', label: 'Ternera 1 año mayor' },
  { value: 'TERNERA_1_ANO_MENOR', label: 'Ternera 1 año menor' },
  { value: 'TERNERA_MAYOR', label: 'Ternera Mayor' },
  { value: 'TERNERA_MENOR', label: 'Ternera Menor' },
  { value: 'TERNERA_MENOR_INTERMEDIA', label: 'Ternera Menor Intermedia' },
  { value: 'VACA_2_ANOS_MAYOR_LACTACION', label: 'Vaca 2 años mayor lactación' },
  { value: 'VACA_2_ANOS_MENOR_LACTACION', label: 'Vaca 2 años menor lactación' },
  { value: 'VACA_3_ANOS_MAYOR_LACTACION', label: 'Vaca 3 años mayor lactación' },
  { value: 'VACA_3_ANOS_MENOR_LACTACION', label: 'Vaca 3 años menor lactación' },
  { value: 'VACA_4_ANOS_LACTACION', label: 'Vaca 4 años lactación' },
  { value: 'VACA_5_ANOS_LACTACION', label: 'Vaca 5 años en lactación' },
  { value: 'VACA_ADULTA_LACTACION', label: 'Vaca Adulta en lactación' },
  { value: 'VACAS_SECA_UNICA', label: 'Vacas en seca (Categoría Única)' },
] as const

export const RAZAS_GANADO = [
  { value: 'BROWN_SWISS_PDP', label: 'Brown Swiss PDP' },
  { value: 'BROWN_SWISS_PPC', label: 'Brown Swiss PPC' },
  { value: 'FLECKVIEH_PDP', label: 'Fleckvieh PDP' },
  { value: 'FLECKVIEH_PPC', label: 'Fleckvieh PPC' },
  { value: 'HOLSTEIN_PDP', label: 'Holstein PDP' },
  { value: 'HOLSTEIN_PPC', label: 'Holstein PPC' },
  { value: 'JERSEY_PDP', label: 'Jersey PDP' },
  { value: 'JERSEY_PPC', label: 'Jersey PPC' },
] as const

export const SEXOS_GANADO = [
  { value: 'MACHO', label: 'Macho' },
  { value: 'HEMBRA', label: 'Hembra' },
] as const

// Funciones helper
export function getCategoriaLabel(value: string): string {
  return CATEGORIAS_GANADO.find(cat => cat.value === value)?.label || value
}

export function getRazaLabel(value: string): string {
  return RAZAS_GANADO.find(raza => raza.value === value)?.label || value
}

export function getSexoLabel(value: string): string {
  return SEXOS_GANADO.find(sexo => sexo.value === value)?.label || value
}