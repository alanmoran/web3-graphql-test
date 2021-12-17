import { ApolloServer, gql, ApolloError } from 'apollo-server-micro'
import Web3 from "web3";
import { ABI, vaultAddress } from "../../constants"
import * as dotenv from "dotenv";
dotenv.config();


console.log('Am I serverless?');

const alchemyId = process.env.ALCHMEY_KEY;
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://eth-rinkeby.alchemyapi.io/v2/${alchemyId}`
  )
);


const typeDefs = gql`
  type Query {
    vaults: [Vault!]!
  }
  type Vault {
    mgmtFee: String,
    name: String,
    symbol: String
  }
`

const resolvers = {

  Query: {
    async vaults(parent, args, context) {
      console.log('api hit');
      const vaultInfo = await getVaultInfo();
      return [vaultInfo]
    },
  },
}

async function getContract() {
  const vaultContract = new web3.eth.Contract(ABI, vaultAddress);
  return vaultContract
}


async function getVaultInfo() {
  const vaultContract = await getContract()
  if (!vaultContract) {
    console.log("no vault contract found..? ")
    throw new ApolloError('no vault contract found..?');
  }

  // console.log(vaultContract)
  console.log("get vault info")
  const mgmtFee = await vaultContract.methods.managementFee().call();
  const name = await vaultContract.methods.name().call();
  const symbol = await vaultContract.methods.symbol().call();

  return { mgmtFee: mgmtFee, name: name, symbol: symbol }
}


const apolloServer = new ApolloServer({ typeDefs, resolvers })

const startServer = apolloServer.start()

export default async function handler(req, res) {
  console.log('handler');
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  if (req.method === 'OPTIONS') {
    res.end()
    return false
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
