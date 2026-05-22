import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './state/auth';
import { BrandingProvider } from './state/branding';

createRoot(document.getElementById('app')).render(
    <BrowserRouter>
        <AuthProvider>
            <BrandingProvider>
                <App />
            </BrandingProvider>
        </AuthProvider>
    </BrowserRouter>
);