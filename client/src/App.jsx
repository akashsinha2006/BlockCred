import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/Auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Issue from './pages/Issue';
import Credentials from './pages/Credentials';
import Details from './pages/Details';
import Verify from './pages/Verify';
import About from './pages/About';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><span className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><span className="spinner" /></div>;
  return <Navigate to={user ? '/dashboard' : '/verify'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/verify/:id" element={<Verify />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/issue" element={<Issue />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/credentials/:id" element={<Details />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="*" element={<div className="splash col"><h2>Page not found</h2><a className="btn primary" href="/">Go home</a></div>} />
    </Routes>
  );
}
