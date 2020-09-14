import {NextPage} from "next";

const ChangePassword:NextPage<{token: string}> = () => {
  return (
  <>

  </>
  )
}

ChangePassword.getInitialProps = ({query}) => {
  return {
    token: query.token as string
  }
}

export default ChangePassword
