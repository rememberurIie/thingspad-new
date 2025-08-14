// App.jsx
import './App.css';
import { RouterProvider } from 'react-router';
import router from "./routes/Router.js";

// 1) โหลด i18n config
import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';

function App() {
  return (
    // 2) ห่อด้วย I18nextProvider
    <I18nextProvider i18n={i18n}>
      {/* router */}
      <RouterProvider router={router} />
    </I18nextProvider>
  );
}

export default App;
