import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { createContext, useState } from 'react'
import { Countdown } from './components/Countdown'
import { NewCycleForm } from './components/NewCycleForm'

import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton
} from './styles'
interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface cyclesContextData {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountsSecondPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void 
}

export const CyclesContext = createContext({} as cyclesContextData)

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O clico precisa ser de no máximo 60 minutos.')
    .max(60, 'O clico precisa ser de no máximo 60 minutos.'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

export const Home = () => {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setactiveCycleId] = useState<string | null>(null)
  const [amountsSecondPassed, setAmountsSecondPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
        resolver: zodResolver(newCycleFormValidationSchema),
        defaultValues: {
          task: '',
          minutesAmount: 0
        }
      })

  const { handleSubmit, watch, reset } = newCycleForm

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function setSecondsPassed(seconds: number) {
    setAmountsSecondPassed(seconds)
  }

  function markCurrentCycleAsFinished() {
    setCycles(state =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, finishedDate: new Date() }
        } else {
          return cycle
        }
      }))
  }

  function handleCreateNewCycle(data: NewCycleFormData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date()
    }

    setCycles((state) => [...state, newCycle])
    setactiveCycleId(id)
    setAmountsSecondPassed(0)

    reset()
  }

  function handleInterruptCycle() {

    setCycles(state =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )

    setactiveCycleId(null)
  }

  const task = watch('task')
  const isSubmitDisabled = !task

  console.log(cycles);

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <CyclesContext.Provider 
          value={{ 
            activeCycle, 
            activeCycleId, 
            amountsSecondPassed, 
            markCurrentCycleAsFinished,
            setSecondsPassed}}
        >
          <FormProvider {...newCycleForm}>
            <NewCycleForm />
          </FormProvider>

          <Countdown />

        </CyclesContext.Provider>

        {
          activeCycle ? (
            <StopCountdownButton onClick={handleInterruptCycle} type="button">
              <HandPalm size={24} />
              Interromper
            </StopCountdownButton>
          ) : (
            <StartCountdownButton disabled={isSubmitDisabled} type="submit">
              <Play size={24} />
              Começar
            </StartCountdownButton>
          )
        }
      </form>
    </HomeContainer>
  )
}