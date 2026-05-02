import { createContext, useEffect, useState } from "react";
import axios from 'axios'
const CartContext = createContext();
export default CartContext;

export const CartProvider = ({ children }) => {

  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Initialize loginStatus from localStorage and token
  const [loginStatus, setLoginStatusState] = useState(() => {
    return localStorage.getItem("loginStatus") === "true";
  });

  // Wrapper for setLoginStatus to persist to localStorage
  const setLoginStatus = (status) => {
    setLoginStatusState(status);
    localStorage.setItem("loginStatus", status.toString());
  };

  const [mydata, setData] = useState([]);
  const [catalogData, setCatalog] = useState([]);
  const [RegisterStatus, SetRegisterStatus] = useState(false);
  const [mycategory, setCategory] = useState();
  const [ImageVto, setImageVto] = useState([])
  const [user, setUserInfo] = useState(() => {
  const token = localStorage.getItem("token")
  if (!token) return null
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]))
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token")
      localStorage.removeItem("loginStatus")
      return null
    }
    return decoded
  } catch {
    localStorage.removeItem("token")
    localStorage.removeItem("loginStatus")
    return null
  }
})
  const [productData, setProductData] = useState([])
  const [items, setItems] = useState([])
const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");


  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get(`${BACKEND_URI}/products`)
      setProductData(response.data.products)
    }
    fetch();
  }, [])



  const addVtoImage = (product) => {
    setImageVto([product]);
  };

  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${BACKEND_URI}/products`)
      // console.log(response.data.products)
      setCatalog(response.data.products);
      setData(response.data.products)
    };
    fetchProducts();
  }, [])

  useEffect(() => {
  }, [mycategory])

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, mycategory, setCategory, removeFromCart,
        clearCart, catalogData, mydata, loginStatus, setLoginStatus,
        RegisterStatus, SetRegisterStatus, ImageVto, addVtoImage, user, setUserInfo, productData, setProductData,
        items
      }}>
      {children}
    </CartContext.Provider>
  );
};
