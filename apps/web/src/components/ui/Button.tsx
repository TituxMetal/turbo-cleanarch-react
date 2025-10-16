interface ButtonProps {
  buttonAction: () => void
  text: string
}

export const Button = ({ buttonAction, text }: ButtonProps) => (
  <button
    className='px-4 py-2 bg-blue-500 text-zinc-100 font-bold rounded hover:bg-blue-600'
    onClick={buttonAction}
    type='button'
  >
    {text}
  </button>
)
