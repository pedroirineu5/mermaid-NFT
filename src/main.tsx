import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from "react-router";
import { createBrowserRouter } from 'react-router';
import MusicPage from './pages/MusicPage.tsx';
import MusicPage2 from './pages/MusicPage2.tsx';
import MusicPage3 from  './pages/MusicPage3.tsx'; 
import ProdutorPage from './pages/ProdutorPage.tsx';
import ProdutorView from './pages/ProdutorView.tsx';
import ProdutorView2 from './pages/ProdutorView2.tsx';
import ProdutorView3 from './pages/ProdutorView3.tsx';
import CriarMusicPage from './pages/CriarMusicPage.tsx';

const route = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/music',
    element: <MusicPage />,
  },
  {
    path: '/music2',
    element: <MusicPage2 />,
  },
  {
    path: '/music3',
    element: <MusicPage3 />,
  },
  {
    path:'/produtor',
    element:<ProdutorPage />
  },
  {
    path:'/produtorView',
    element:<ProdutorView />
  },
  {
    path:'/produtorView2',
    element:<ProdutorView2 />
  },
  {
    path:'/produtorView3',
    element:<ProdutorView3 />
  },
  {
    path:'/CriarMusicPage',
    element:<CriarMusicPage />
  }
  
])

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <RouterProvider router={route}/>
  </StrictMode>
  
)