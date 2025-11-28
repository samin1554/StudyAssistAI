import { createContext, useContext, useState, useEffect, useRef } from 'react';
import keycloak from './keycloak';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isRun = useRef(false);

    useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;

        const initKeycloak = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'login-required',
                    checkLoginIframe: false,
                });

                setIsAuthenticated(authenticated);

                if (authenticated) {
                    setToken(keycloak.token);
                    const profile = await keycloak.loadUserProfile();
                    setUserProfile(profile);
                }
            } catch (err) {
                console.error("Keycloak init failed", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        initKeycloak();
    }, []);

    const login = () => keycloak.login();
    const logout = () => keycloak.logout();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900 p-4">
                <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                <p className="mb-4">Failed to initialize authentication.</p>
                <pre className="bg-red-100 p-4 rounded text-sm overflow-auto max-w-full">
                    {JSON.stringify(error, null, 2)}
                </pre>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, userProfile, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
