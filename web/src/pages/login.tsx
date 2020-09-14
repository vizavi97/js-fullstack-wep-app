import React from 'react'
import {Form, Formik} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/core/dist";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {useLoginMutation} from "../generated/graphql";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const router = useRouter()
  const [,login] = useLoginMutation()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{usernameOrEmail: '',password: ''}}
        onSubmit={ async (values, {setErrors}) => {
          const response = await login(values)
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting}) => {
          return (
            <Form>
              <InputField
                name='usernameOrEmail'
                placeholder="username or email"
                label='Username or Email'
              />
              <Box mt={6}>
                <InputField
                  name='password'
                  placeholder="password"
                  label='Password'
                  type="password"
                />
              </Box>
              <Button type={"submit"} mt={4} isLoading={isSubmitting} variant={"outline"} variantColor="teal">login</Button>
            </Form>
          )
        }}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Login)
