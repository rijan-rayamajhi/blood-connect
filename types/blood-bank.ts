export interface BloodBank {
    id: string
    name: string
    latitude: number
    longitude: number
    averageResponseMinutes: number
    inventory: {
        bloodGroup: string
        quantity: number
    }[]
}
