import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './store';
import { ToastContainer } from './components/ui';

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </StoreProvider>
  );
}
