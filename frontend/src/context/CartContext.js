import axios from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

function CartContextProvider(props) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart
      ? JSON.parse(savedCart)
      : { busyTimes: [], selectedDateTime: undefined };
  });
  const [cartLength, setCartLength] = useState(0);
  const [cartContextResponse, setCartResponse] = useState("");
  const { loggedIn } = useContext(AuthContext);

  const getCart = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const data = response.data;
        setCart((prev) => ({ ...prev, data }));
        setCartLength(data.services?.length || 0);
      } else {
        console.log("Error getting cart: " + response);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [setCart, setCartLength]);

  var isMounted = useRef(false);

  const fetchBusyTimes = useCallback(
    async ({ customerLocation, expectedTimeToComplete, serviceNames }) => {
      try {
        const response = await axios.post(
          "https://ramsaysdetailing.ca:4000/api/bookings/busyTimes",
          {
            customerLocation,
            expectedTimeToComplete,
            serviceNames,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const busyEvents = response.data;
        setCart((prev) => ({ ...prev, busyTimes: busyEvents }));
        console.log(busyEvents);
      } catch (error) {
        console.error("Error fetching busy events:", error);
      }
    },
    [setCart]
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!isMounted.current && loggedIn !== undefined && loggedIn) {
      getCart();
      isMounted.current = true;
    }
  }, [loggedIn, getCart, fetchBusyTimes]);

  async function addToCartContext(service) {
    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          service,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = await response.data;
        console.log("Item added to cart: ", data);
        setCart(data);
        toast.success("Item added to cart");
        console.log(cartLength + 1);
        setCartLength(cartLength + 1);
      } else {
        toast.error("failed to add item to cart");
        console.error("failed to add item to cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function removeFromCartContext(service) {
    if (!cart) {
      return; // No items in the cart, nothing to remove
    }
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            _id: service._id,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Item removed from cart: ", data);
        setCart(data);
        setCartLength(cartLength - 1);
        toast.success("Item removed from cart");
      } else {
        toast.error("failed to remove item from cart");
        console.error("failed to remove item from cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const clearCartContext = async () => {
    if (!cart) {
      return; // No items in the cart, nothing to remove
    }
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/cart/clear",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Cart Cleared");
        setCart(data);
        setCartLength(0);
      } else {
        console.error("failed to clear cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        fetchBusyTimes,
        cart,
        setCart,
        cartLength,
        cartContextResponse,
        setCartResponse,
        getCart,
        addToCartContext,
        removeFromCartContext,
        clearCartContext,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}

export default CartContext;

export { CartContextProvider };
