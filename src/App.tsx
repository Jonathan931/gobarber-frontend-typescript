import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import GlobalStyle from './styles/global';
// import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

import { AuthProvider } from './hooks/AuthContext';

const App: React.FC = () => (
  <>
    <BrowserRouter>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </BrowserRouter>
    <GlobalStyle />
  </>
);

export default App;
