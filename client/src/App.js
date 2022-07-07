import './App.css';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';

import Terms from "./pages/TermsAndConditions";
import About from './pages/About';
import NoMatch from './pages/NoMatch';


const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          {/* place for header if needed */ }
          <div>
            <Routes>
              <Route
                path="/terms"
                element={<Terms />}
              />
              <Route
                path='/about'
                element={<About />}
              />
              <Route
                path='*'
                element={<NoMatch />}
              />
            </Routes>
          </div>
          {/* place for footer if needed */}
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
