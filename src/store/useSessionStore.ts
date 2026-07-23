import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase, isCloudConfigured } from '../lib/supabaseClient'

const LOCAL_MODE_KEY = 'mis-gastos:local-mode-chosen'

function readLocalModeChosen(): boolean {
  try {
    return localStorage.getItem(LOCAL_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeLocalModeChosen(value: boolean) {
  try {
    if (value) localStorage.setItem(LOCAL_MODE_KEY, 'true')
    else localStorage.removeItem(LOCAL_MODE_KEY)
  } catch {
    // localStorage no disponible (modo privado, etc.) - no bloquea el flujo
  }
}

export type SessionMode = 'loading' | 'cloud' | 'local' | 'undecided'

interface SessionState {
  user: User | null
  localModeChosen: boolean
  mode: SessionMode
  /** true cuando alguien en modo local pidio explicitamente ver la pantalla de login. */
  authRequested: boolean
  chooseLocalMode: () => void
  resetLocalModeChoice: () => void
  requestAuth: () => void
  dismissAuthRequest: () => void
  signOut: () => Promise<void>
  _setUser: (user: User | null) => void
}

function computeMode(loading: boolean, user: User | null, localModeChosen: boolean): SessionMode {
  if (loading) return 'loading'
  if (user) return 'cloud'
  if (localModeChosen) return 'local'
  return 'undecided'
}

const initialLocalModeChosen = readLocalModeChosen()

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  localModeChosen: initialLocalModeChosen,
  mode: computeMode(isCloudConfigured, null, initialLocalModeChosen),
  authRequested: false,

  chooseLocalMode: () => {
    writeLocalModeChosen(true)
    set((state) => ({ localModeChosen: true, mode: computeMode(false, state.user, true) }))
  },

  /** Se usa tras migrar datos locales a una cuenta nueva, para no "recordar" el modo local viejo. */
  resetLocalModeChoice: () => {
    writeLocalModeChosen(false)
    set((state) => ({ localModeChosen: false, mode: computeMode(false, state.user, false) }))
  },

  requestAuth: () => set({ authRequested: true }),
  dismissAuthRequest: () => set({ authRequested: false }),

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set((state) => ({ user: null, mode: computeMode(false, null, state.localModeChosen), authRequested: false }))
  },

  _setUser: (user) => {
    set((state) => ({
      user,
      mode: computeMode(false, user, state.localModeChosen),
      authRequested: user ? false : state.authRequested,
    }))
  },
}))

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useSessionStore.getState()._setUser(data.session?.user ?? null)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useSessionStore.getState()._setUser(session?.user ?? null)
  })
}

export function getSessionState() {
  return useSessionStore.getState()
}
