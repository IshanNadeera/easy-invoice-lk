import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

// A data router is required for useBlocker (unsaved-changes warning).
const router = createBrowserRouter(routes);

export function App() {
  return <RouterProvider router={router} />;
}
