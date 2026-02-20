import axios from "axios";

export const API = axios.create({
  baseURL: "https://expert-booking-8fq2.onrender.com", // live backend URL
});