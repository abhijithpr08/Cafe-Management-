import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://cafe-management-go4c.onrender.com/api',
  timeout: 10000,
})

export default apiClient
