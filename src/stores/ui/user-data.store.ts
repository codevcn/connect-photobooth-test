import { create } from 'zustand'

type TUseUserStore = {
  deviceId: string | null

  setDeviceId: (id: string) => void
  getDeviceId: () => string | null
}

export const useUserDataStore = create<TUseUserStore>((set, get) => ({
  deviceId: null,

  setDeviceId: (id) => {
    set({ deviceId: id })
  },
  getDeviceId: () => {
    return get().deviceId
  },
}))
