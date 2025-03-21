import React from 'react';
import CategoryPage from '../components/products/CategoryPage';

const AccessoriesPage: React.FC = () => {
  return (
    <CategoryPage 
      categorySlug="accessories"
      categoryName="Accessories"
      categoryDescription="Browse our essential accessories for hookah and vape maintenance. Find everything you need to enhance your smoking experience, from charcoal burners to premium hoses."
      bannerImage="/images/category-accessories.jpg"
    />
  );
};

export default AccessoriesPage;
