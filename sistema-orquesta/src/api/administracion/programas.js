// src/api/administracion/programas.js
import axios from "axios";
const API = "http://localhost:4000/administracion/programas";

export const getProgramas = () => axios.get(API);
