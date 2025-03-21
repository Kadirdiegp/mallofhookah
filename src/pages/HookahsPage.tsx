import React from 'react';
import CategoryPage from '../components/products/CategoryPage';

const HookahsPage: React.FC = () => {
  return (
    <CategoryPage 
      categorySlug="hookahs"
      categoryName="Hookahs"
      categoryDescription="Discover our premium collection of hookahs for the ultimate smoking experience. From traditional designs to modern innovations, find the perfect hookah for your style."
      bannerImage="/images/category-hookah.jpg"
    />
  );
};

export default HookahsPage;
