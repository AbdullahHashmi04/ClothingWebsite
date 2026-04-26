import { createContext, useEffect, useState } from "react";
import axios from 'axios'
const CartContext = createContext();
export default CartContext;

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);
  const [mydata, setData] = useState([]);
  const [catalogData, setCatalog] = useState([]);
  const [loginStatus, setLoginStatus] = useState(false);
  const [RegisterStatus, SetRegisterStatus] = useState(false);
  const [mycategory, setCategory] = useState();
  const [ImageVto, setImageVto] = useState([])
  const [user, setUserInfo] = useState([])
  const [productData, setProductData] = useState([])
  const [items, setItems] = useState([])
const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await axios.get("http://localhost:3000/trending");
  //     setItems(response.data);
  //   }
  //   fetchData();
  // }, []);

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
    setCart([...cart, product]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

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
