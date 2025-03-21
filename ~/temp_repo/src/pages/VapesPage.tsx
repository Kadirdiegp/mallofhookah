import React from 'react';
import CategoryPage from '../components/products/CategoryPage';

const VapesPage: React.FC = () => {
  return (
    <CategoryPage 
      categorySlug="vapes"
      categoryName="Vapes"
      categoryDescription="Explore our selection of premium vaping devices and supplies. From starter kits to advanced mods, we have everything you need for a superior vaping experience."
      bannerImage="/images/category-vape.jpg"
    />
  );
};

export default VapesPage;
