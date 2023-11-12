import { getUsers } from '@/lib/api'
import { REFRESH_INTERVAL } from '@/lib/config'
import { User } from '@/types'
import { useQuery } from 'react-query'

const UserCount = () => {
  const query = useQuery<User[]>('getUsers', getUsers, {
    refetchInterval: REFRESH_INTERVAL
  })

  return (
    <h3>
      Online users: <b>{query?.data?.length ?? 0}</b>
    </h3>
  )
}

export default UserCount
