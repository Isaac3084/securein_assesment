import React, { useState } from 'react';

const RecipeDrawer = ({ recipe, onClose, isOpen }) => {
    const [isTimeExpanded, setIsTimeExpanded] = useState(false);

    if (!recipe) return null;

    return (
        <>
            {isOpen && (
                <div className="drawer-overlay" onClick={onClose} />
            )}
            <div className={`drawer ${isOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{recipe.title}</h2>
                        <span className="badge" style={{ marginTop: '0.5rem' }}>{recipe.cuisine}</span>
                    </div>
                    <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>✕</button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{recipe.description}</p>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <div
                        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                        onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                    >
                        <strong>Total Time: {recipe.total_time} mins</strong>
                        <span>{isTimeExpanded ? '−' : '+'}</span>
                    </div>

                    {isTimeExpanded && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <small style={{ color: 'var(--text-secondary)' }}>Prep Time</small>
                                <div>{recipe.prep_time} mins</div>
                            </div>
                            <div>
                                <small style={{ color: 'var(--text-secondary)' }}>Cook Time</small>
                                <div>{recipe.cook_time} mins</div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nutrition</h3>
                    {recipe.nutrients && typeof recipe.nutrients === 'object' ? (
                        <div className="card">
                            <table>
                                <tbody>
                                    {Object.entries(recipe.nutrients).map(([key, value]) => (
                                        <tr key={key}>
                                            <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 500 }}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-secondary">No nutrition info available.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default RecipeDrawer;
