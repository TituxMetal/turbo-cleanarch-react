import { useState } from 'react'

import { Button } from '~/components/ui/Button'

export const App = () => {
  const [count, setCount] = useState(0)

  return (
    <section className='flex flex-col items-center justify-center min-h-screen bg-zinc-700 text-zinc-100'>
      <h1 className='text-4xl font-extrabold text-cyan-400'>Hello React + Vite + Tailwind!</h1>
      <section className='flex flex-col items-center gap-4 mt-4'>
        <p className='text-lg'>Count is: {count}</p>
        <Button buttonAction={() => setCount(count => count + 1)} text='Increment' />
        <Button buttonAction={() => setCount(count => count - 1)} text='Decrement' />
      </section>
    </section>
  )
}
