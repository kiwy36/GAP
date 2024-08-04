// src/components/Home/Home.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase.js';
import Login from '../Login/Login';
import Register from '../Register/Register';
import './Home.css';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="home-container">
        {user ? (
            <h2>¡Bienvenido, {user.email}!</h2>
        ) : (
            <div className="auth-section">
            <Login />
            <Register />
            </div>
        )}
        </div>
    );
};

export default Home;
