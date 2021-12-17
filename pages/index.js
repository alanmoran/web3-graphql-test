import useSWR from 'swr'

const fetcher = (query) =>
  fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((json) => json.data)

export default function Index() {
  const { data, error } = useSWR('{ vaults { mgmtFee, name, symbol } }', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const { vaults } = data

  return (
    <div>
      {vaults.map((vault, i) => (
        <div key={i}>

          <p>
          Fee: {vault.mgmtFee}
          <br />
          Name: {vault.name}&#10;
          <br />
          Symbol: {vault.symbol}&#10;
          </p>
          </div>
        
      ))}
    </div>
  )
}
