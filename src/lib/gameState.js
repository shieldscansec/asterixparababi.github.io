import { createContext, useContext, useReducer } from 'react'

// Estado inicial do jogo
const initialState = {
  currentScene: 'intro',
  playerName: '',
  choices: [],
  relationshipLevel: 0, // 0-100, medindo a proximidade entre Kael e Lyra
  discoveryLevel: 0, // 0-100, medindo o conhecimento sobre o paranormal
  gameProgress: {
    chaptersCompleted: 0,
    totalChapters: 5,
    currentChapter: 1
  },
  characters: {
    kael: {
      name: 'Kael',
      mood: 'curious', // curious, nervous, confident, romantic
      trust: 50 // 0-100
    },
    lyra: {
      name: 'Lyra',
      mood: 'mysterious', // mysterious, playful, serious, romantic
      trust: 50 // 0-100
    }
  },
  inventory: [], // itens coletados durante o jogo
  flags: {} // flags para controlar eventos específicos
}

// Ações do reducer
const gameActions = {
  SET_SCENE: 'SET_SCENE',
  MAKE_CHOICE: 'MAKE_CHOICE',
  UPDATE_RELATIONSHIP: 'UPDATE_RELATIONSHIP',
  UPDATE_DISCOVERY: 'UPDATE_DISCOVERY',
  UPDATE_CHARACTER_MOOD: 'UPDATE_CHARACTER_MOOD',
  UPDATE_CHARACTER_TRUST: 'UPDATE_CHARACTER_TRUST',
  ADD_TO_INVENTORY: 'ADD_TO_INVENTORY',
  SET_FLAG: 'SET_FLAG',
  ADVANCE_CHAPTER: 'ADVANCE_CHAPTER',
  SET_PLAYER_NAME: 'SET_PLAYER_NAME',
  RESET_GAME: 'RESET_GAME'
}

// Reducer para gerenciar o estado do jogo
function gameReducer(state, action) {
  switch (action.type) {
    case gameActions.SET_SCENE:
      return {
        ...state,
        currentScene: action.payload
      }
    
    case gameActions.MAKE_CHOICE:
      return {
        ...state,
        choices: [...state.choices, action.payload],
        currentScene: action.payload.nextScene || state.currentScene
      }
    
    case gameActions.UPDATE_RELATIONSHIP:
      const newRelationshipLevel = Math.max(0, Math.min(100, state.relationshipLevel + action.payload))
      return {
        ...state,
        relationshipLevel: newRelationshipLevel
      }
    
    case gameActions.UPDATE_DISCOVERY:
      const newDiscoveryLevel = Math.max(0, Math.min(100, state.discoveryLevel + action.payload))
      return {
        ...state,
        discoveryLevel: newDiscoveryLevel
      }
    
    case gameActions.UPDATE_CHARACTER_MOOD:
      return {
        ...state,
        characters: {
          ...state.characters,
          [action.payload.character]: {
            ...state.characters[action.payload.character],
            mood: action.payload.mood
          }
        }
      }
    
    case gameActions.UPDATE_CHARACTER_TRUST:
      const character = action.payload.character
      const trustChange = action.payload.change
      const newTrust = Math.max(0, Math.min(100, state.characters[character].trust + trustChange))
      
      return {
        ...state,
        characters: {
          ...state.characters,
          [character]: {
            ...state.characters[character],
            trust: newTrust
          }
        }
      }
    
    case gameActions.ADD_TO_INVENTORY:
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      }
    
    case gameActions.SET_FLAG:
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.payload.key]: action.payload.value
        }
      }
    
    case gameActions.ADVANCE_CHAPTER:
      return {
        ...state,
        gameProgress: {
          ...state.gameProgress,
          currentChapter: state.gameProgress.currentChapter + 1,
          chaptersCompleted: state.gameProgress.chaptersCompleted + 1
        }
      }
    
    case gameActions.SET_PLAYER_NAME:
      return {
        ...state,
        playerName: action.payload
      }
    
    case gameActions.RESET_GAME:
      return initialState
    
    default:
      return state
  }
}

// Context para o estado do jogo
const GameContext = createContext()

// Provider do contexto
export function GameProvider({ children }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  
  // Funções auxiliares para facilitar o uso
  const gameActions = {
    setScene: (scene) => dispatch({ type: 'SET_SCENE', payload: scene }),
    
    makeChoice: (choice) => dispatch({ type: 'MAKE_CHOICE', payload: choice }),
    
    updateRelationship: (change) => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: change }),
    
    updateDiscovery: (change) => dispatch({ type: 'UPDATE_DISCOVERY', payload: change }),
    
    updateCharacterMood: (character, mood) => dispatch({ 
      type: 'UPDATE_CHARACTER_MOOD', 
      payload: { character, mood } 
    }),
    
    updateCharacterTrust: (character, change) => dispatch({ 
      type: 'UPDATE_CHARACTER_TRUST', 
      payload: { character, change } 
    }),
    
    addToInventory: (item) => dispatch({ type: 'ADD_TO_INVENTORY', payload: item }),
    
    setFlag: (key, value) => dispatch({ 
      type: 'SET_FLAG', 
      payload: { key, value } 
    }),
    
    advanceChapter: () => dispatch({ type: 'ADVANCE_CHAPTER' }),
    
    setPlayerName: (name) => dispatch({ type: 'SET_PLAYER_NAME', payload: name }),
    
    resetGame: () => dispatch({ type: 'RESET_GAME' })
  }
  
  return (
    <GameContext.Provider value={{ gameState, gameActions }}>
      {children}
    </GameContext.Provider>
  )
}

// Hook para usar o contexto do jogo
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame deve ser usado dentro de um GameProvider')
  }
  return context
}

// Funções utilitárias para lógica do jogo
export const gameUtils = {
  // Calcula o nível de relacionamento baseado nas escolhas
  calculateRelationshipStatus: (level) => {
    if (level >= 80) return { status: 'Apaixonados', color: 'text-red-400' }
    if (level >= 60) return { status: 'Muito Próximos', color: 'text-pink-400' }
    if (level >= 40) return { status: 'Amigos Íntimos', color: 'text-purple-400' }
    if (level >= 20) return { status: 'Conhecidos', color: 'text-blue-400' }
    return { status: 'Estranhos', color: 'text-gray-400' }
  },
  
  // Calcula o nível de descoberta paranormal
  calculateDiscoveryStatus: (level) => {
    if (level >= 80) return { status: 'Investigador Experiente', color: 'text-green-400' }
    if (level >= 60) return { status: 'Conhecedor do Oculto', color: 'text-yellow-400' }
    if (level >= 40) return { status: 'Curioso', color: 'text-blue-400' }
    if (level >= 20) return { status: 'Iniciante', color: 'text-gray-400' }
    return { status: 'Cético', color: 'text-red-400' }
  },
  
  // Verifica se uma escolha está disponível baseada no estado atual
  isChoiceAvailable: (choice, gameState) => {
    if (!choice.requirements) return true
    
    const { relationshipLevel, discoveryLevel, flags, characters } = gameState
    const req = choice.requirements
    
    if (req.minRelationship && relationshipLevel < req.minRelationship) return false
    if (req.minDiscovery && discoveryLevel < req.minDiscovery) return false
    if (req.requiredFlags) {
      for (const flag of req.requiredFlags) {
        if (!flags[flag]) return false
      }
    }
    if (req.characterTrust) {
      for (const [character, minTrust] of Object.entries(req.characterTrust)) {
        if (characters[character].trust < minTrust) return false
      }
    }
    
    return true
  },
  
  // Aplica os efeitos de uma escolha
  applyChoiceEffects: (choice, gameActions) => {
    if (!choice.effects) return
    
    const effects = choice.effects
    
    if (effects.relationshipChange) {
      gameActions.updateRelationship(effects.relationshipChange)
    }
    
    if (effects.discoveryChange) {
      gameActions.updateDiscovery(effects.discoveryChange)
    }
    
    if (effects.characterMoodChanges) {
      for (const [character, mood] of Object.entries(effects.characterMoodChanges)) {
        gameActions.updateCharacterMood(character, mood)
      }
    }
    
    if (effects.characterTrustChanges) {
      for (const [character, change] of Object.entries(effects.characterTrustChanges)) {
        gameActions.updateCharacterTrust(character, change)
      }
    }
    
    if (effects.addToInventory) {
      gameActions.addToInventory(effects.addToInventory)
    }
    
    if (effects.setFlags) {
      for (const [key, value] of Object.entries(effects.setFlags)) {
        gameActions.setFlag(key, value)
      }
    }
    
    if (effects.nextScene) {
      gameActions.setScene(effects.nextScene)
    }
  }
}

