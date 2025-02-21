// Mock des composants UI
export const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
)

export const Form = ({ children }: any) => <form>{children}</form>

export const FormField = ({ render }: any) => render({ field: {} })

export const FormItem = ({ children }: any) => <div>{children}</div>

export const FormLabel = ({ children }: any) => <label>{children}</label>

export const FormControl = ({ children }: any) => <div>{children}</div>

export const FormMessage = () => null

export const Input = (props: any) => <input {...props} /> 