import { getUsers } from '@/lib/api'
import { User } from '@/types'
import { useQuery } from 'react-query'

const UserCount = () => {
  const query = useQuery<User[]>('getUsers', getUsers, {
    refetchInterval: 10_000
  })

  return (
    <h3>
      Online users: <b>{query?.data?.length ?? 0}</b>
    </h3>
  )
}

export default UserCount
