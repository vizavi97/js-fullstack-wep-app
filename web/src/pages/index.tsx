import React from "react";
import {NavBar} from "../components/NavBar";
import {withUrqlClient} from 'next-urql'
import {createUrqlClient} from '../utils/createUrqlClient'
import {usePostsQuery} from "../generated/graphql";

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <>
      <NavBar/>
      {!data ? null : data.posts.map(post => <div key={post.id}>{post.title}</div>)}
    </>
  )
}

export default withUrqlClient(createUrqlClient, {ssr:true})(Index)
