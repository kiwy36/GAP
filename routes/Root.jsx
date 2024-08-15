// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../src/components/Home/Home';
import Footer from '../src/components/Footer/Footer';
import Navbar from '../src/components/Navbar/Navbar';
import UploadProduct from '../src/components/UploadProduct/UploadProduct';
import ReadProducts from '../src/components/ReadProducts/ReadProducts';
import Register from '../src/components/Register/Register';
import Login from '../src/components/Login/Login';
import Store from '../src/components/Store/Store';
import Statistics from '../src/components/Statistics/Statistics';
import './Root.css'
function Root() {
    return (
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadProduct />} />
            <Route path="/read" element={<ReadProducts />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/store" element={<Store />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
  }

export default Root;
