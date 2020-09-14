import React from 'react'
import {Box, Button, Flex, Text} from "@chakra-ui/core/dist";
import NextLink from 'next/link'
import {useLogoutMutation, useMeQuery} from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
  const [{fetching: logoutFetching},logout] = useLogoutMutation()
  const [{data, fetching}] = useMeQuery()
  let body = null;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Flex>
        <Box color={"white"} mx={2}><NextLink href='/login'> Login</NextLink></Box>
        <Box color={"white"} mx={2}><NextLink href='/register'> Register</NextLink></Box>
      </Flex>
    );
  }
  else {
    body = (
     <Flex>
       <Text mr={2}>{data.me.username}</Text>
       <Button variant="link" color="black" isLoading={logoutFetching} onClick={() => logout()}>Logout</Button>
     </Flex>
    )
  }
  return (
    <Flex bg={"tan"} p={4}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  )
}
