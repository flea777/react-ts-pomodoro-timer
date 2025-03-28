import { createContext, ReactNode, useReducer, useState } from "react";
import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'
import { ActionTypes, addNewCycleAction, interruptCurrentCycleAction, markCurrentCycleAsFinishedAction } from "../reducers/cycles/actions";

interface CreateCycleData {
  task: string
  minutesAmount: number
}
interface cyclesContextData {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountsSecondPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
  createNewCycle: (data: CreateCycleData) => void
  interruptCurrentCycle: () => void
}

export const CyclesContext = createContext({} as cyclesContextData)

interface CyclesContextProviderProps {
  children: ReactNode
}

export const CyclesContexProvider = ({ children }: CyclesContextProviderProps) => {
  const [cyclesState, dispatch] = 
    useReducer(cyclesReducer, {
    cycles: [],
    activeCycleId: null,
  })


  const [amountsSecondPassed, setAmountsSecondPassed] = useState(0)

  const { cycles, activeCycleId } = cyclesState
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function setSecondsPassed(seconds: number) {
    setAmountsSecondPassed(seconds)
  }

  function markCurrentCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction)
  }

  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date()
    }


    dispatch(addNewCycleAction(newCycle))
    setAmountsSecondPassed(0)
  }

  function interruptCurrentCycle() {

    dispatch(interruptCurrentCycleAction())
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountsSecondPassed,
        markCurrentCycleAsFinished,
        setSecondsPassed,
        createNewCycle,
        interruptCurrentCycle
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}