import React, { useState, useEffect } from 'react';
import { fetchRecipes, searchRecipes } from './api';
import RecipeDrawer from './components/RecipeDrawer';
import './index.css';

function App() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [filters, setFilters] = useState({
        title: '',
        cuisine: '',
        rating: '',
        calories: '',
        total_time: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            // Check if we have active filters
            const hasFilters = Object.values(filters).some(val => val !== '');

            let data;
            if (hasFilters) {
                const res = await searchRecipes(filters);
                setRecipes(res.data);
                setTotal(res.data.length);
            } else {
                const res = await fetchRecipes(page, limit);
                setRecipes(res.data);
                setTotal(res.total);
            }
        } catch (err) {
            console.error("Failed to load recipes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, limit, filters]);

    const handleRowClick = (recipe) => {
        setSelectedRecipe(recipe);
        setIsDrawerOpen(true);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const renderStars = (rating) => {
        const numRating = Number(rating);
        if (!rating || isNaN(numRating)) return 'N/A';
        const rounded = Math.round(numRating);
        const emptyStars = Math.max(0, 5 - rounded);

        return (
            <span className="star">
                {'★'.repeat(rounded)}
                <span style={{ color: '#e2e8f0' }}>{'★'.repeat(emptyStars)}</span>
            </span>
        );
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#111' }}>
                        Culinary Compass
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>Explore thousands of delicious recipes</p>
                </div>
            </header>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <input
                    className="input"
                    name="title"
                    placeholder="Search Title..."
                    value={filters.title}
                    onChange={handleFilterChange}
                />
                <input
                    className="input"
                    name="cuisine"
                    placeholder="Filter Cuisine..."
                    value={filters.cuisine}
                    onChange={handleFilterChange}
                />
                <input
                    className="input"
                    name="rating"
                    placeholder="Rating (e.g. >=4)"
                    value={filters.rating}
                    onChange={handleFilterChange}
                />
                <input
                    className="input"
                    name="calories"
                    placeholder="Calories (e.g. <=500)"
                    value={filters.calories}
                    onChange={handleFilterChange}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Per Page:</label>
                    <select
                        className="input"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            <div className="card table-container">
                {loading ? (
                    <div className="state-empty">Loading recipes...</div>
                ) : recipes.length === 0 ? (
                    <div className="state-empty">
                        <h3>No Recipes Found</h3>
                        <p>Try adjusting your search filters.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Title</th>
                                <th>Cuisine</th>
                                <th>Rating</th>
                                <th>Total Time</th>
                                <th>Serves</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recipes.map(recipe => (
                                <tr key={recipe.id} onClick={() => handleRowClick(recipe)}>
                                    <td>
                                        <div className="title-text" style={{ fontWeight: 500 }}>{recipe.title}</div>
                                    </td>
                                    <td>
                                        <span className="badge">{recipe.cuisine || 'Unknown'}</span>
                                    </td>
                                    <td>{renderStars(recipe.rating)} <small style={{ color: 'var(--text-tertiary)' }}>({recipe.rating})</small></td>
                                    <td>{recipe.total_time ? `${recipe.total_time} min` : '-'}</td>
                                    <td>{recipe.serves}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!Object.values(filters).some(x => x) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Showing page {page} of {Math.ceil(total / limit)} ({total} total)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-outline"
                            disabled={page * limit >= total}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <RecipeDrawer
                recipe={selectedRecipe}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
}

export default App;
