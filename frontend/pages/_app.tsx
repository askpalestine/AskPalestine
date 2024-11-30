import '../styles/globals.css'
import Layout from '../components/Layout/Layout'
import { FunctionComponent } from 'react'
import { GetServerSideProps } from 'next'
import {Props} from "../interfaces/_app.interface"

const App: FunctionComponent<Props> = ({ Component, pageProps }) => {
  
  return (
    <div style={{ backgroundColor: "#dfd5ca", display: 'flex', height: 'fit-content', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
    <Layout data={undefined} title={pageProps.title}>
      <Component {...pageProps}/>
    </Layout>
    </div>
  )
}

export default App
