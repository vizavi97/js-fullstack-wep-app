import React, {InputHTMLAttributes} from 'react'
import {FormControl, FormErrorMessage, FormLabel, Input} from "@chakra-ui/core/dist";
import {useField} from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
}

export const InputField :React.FC<InputFieldProps> = ({label,size,...props}) => {
  const [field,{error}] = useField(props)
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} placeholder={props.placeholder}/>
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  )
}
