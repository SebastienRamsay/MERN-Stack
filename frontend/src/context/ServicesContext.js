import axios from "axios";
import React, { createContext, useEffect, useState } from "react"

const ServicesContext = createContext()

function ServicesContextProvider(props){
  const [services, setServices] = useState(undefined)

  async function getServices() { 
    try {
      const response = await axios.get('http://45.74.32.213:4000/api/services', { withCredentials: true });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }

  useEffect(() => {
    getServices()
  }, [])

  return <ServicesContext.Provider value={{services, getServices}}>
    {props.children}
  </ServicesContext.Provider>
}

export default ServicesContext

export { ServicesContextProvider }