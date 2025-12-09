import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const fetchRecipes = async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/recipes`, {
        params: { page, limit }
    });
    return response.data;
};

export const searchRecipes = async (filters) => {
    const response = await axios.get(`${API_URL}/recipes/search`, {
        params: filters
    });
    return response.data;
};
