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
            <>
            <div className='titles-app'>
                <h1>Gestor de almacenamiento de informacion de productos</h1>
                <h2>¡Bienvenido, {user.email}!</h2>
                <h2>En esta app podra subir informacion de sus productos, verla y actualizarla a gusto</h2>
                <h3>proximaneten agregaremos control de stock y info de ventas</h3>
            </div>
            <img className='background-image' src="https://lh3.googleusercontent.com/pw/AP1GczNg294d1O44mTghGBntqW5dO-LhA7hnWUicyp0kkMhG2QNfpdZUY4vWRkzB5Io5qZzgPAVVqU8RZintitNqUsz-PQvN_RajR1WZn-32rl0OvfYQJ4F9oLcr_YWFEGlGQu2VUdOg6P6KE-eRFPVwlOiJkA=w618-h618-s-no?authuser=0" alt="imghome" />
            </>
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
