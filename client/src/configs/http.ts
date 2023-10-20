import axios from 'axios'

import { VITE_BASE_URL } from '@/configs/env'

const instance = axios.create({
  timeout: 2500,
  baseURL: VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// FIXME: do I need interceptors?
// instance.interceptors.request.use(
//   (request: InternalAxiosRequestConfig) => {
//     return request
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error)
//   }
// )

// instance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error)
//   }
// )

export default instance
