import React from 'react'
import {Form, Formik} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/core/dist";
import {useRegisterMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const router = useRouter()
  const [,register] = useRegisterMutation()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{username: '',password: ''}}
        onSubmit={ async (values, {setErrors}) => {
         const response = await register(values)
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting}) => {
          return (
            <Form>
              <InputField
                name='username'
                placeholder="username"
                label='Username'
              />
              <Box mt={6}>
              <InputField
                name='password'
                placeholder="password"
                label='Password'
                type="password"
              />
              </Box>
              <Button type={"submit"} mt={4} isLoading={isSubmitting} variant={"outline"} variantColor="teal">Register</Button>
            </Form>
            )
        }}
      </Formik>
    </Wrapper>
  )
}

export default Register
