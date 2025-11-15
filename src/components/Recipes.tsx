import React from 'react'

const Recipes = () => {
    return (
        <div className="recipe-container">
            <div className="wood"></div>

            <div className="photo-stack">
                <img src="/cake1.jpg" className="photo photo-back" />
                <img src="/cake1.jpg" className="photo photo-front" />
            </div>

            <div className="recipe-card">
                <h2 className="title">Chocolate Cake</h2>
                <div className="stars">★★★★★</div>

                <ul className="ingredients">
                    <li>10 Ounces blackberries</li>
                    <li>2 Eggs</li>
                    <li>½ Cup sugar</li>
                    <li>1 Teaspoon cold water</li>
                    <li>½ Tablespoon lemon juice</li>
                    <li>1 Salt spoon salt</li>
                </ul>

                <button className="btn">See Directions</button>
            </div>
        </div>

    )
}

export default Recipes