
import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom';

import { Publiclayout } from '@/layouts/public-layout';

import { HomePage } from '@/routes/Home';

import AuthenticationLayout from '@/layouts/auth-layout';
import SignInPage from './routes/signin';
import SignUpPage from './routes/signup';
import ProtectedRoutes from './layouts/protected-routes';
import {MainLayout} from './layouts/main-layout';

export default function App() {
  return (
   <Router>
     <Routes>
          {/* public routes this is the default route for the index */}
               <Route element={<Publiclayout/>}>
                <Route index element={<HomePage />}/>
      </Route>
      {/* auth routes*/}
      <Route element={<AuthenticationLayout/>}>
              <Route path='/signin/*' element={<SignInPage/>}/>
              <Route path='/signup/*' element={<SignUpPage/>}/>
      </Route>
      {/* protected routes*/}
      <Route element={
        <ProtectedRoutes>
          <MainLayout/>
        </ProtectedRoutes>
      }
      >
       {/* add your protected routes here */}
       
      </Route>
    </Routes>
    </Router>  
  );
}