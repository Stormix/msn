export const getUsers = async () => {
  const response = await fetch(import.meta.env.VITE_ENDPOINT + '/users')
  return await response.json()
}
