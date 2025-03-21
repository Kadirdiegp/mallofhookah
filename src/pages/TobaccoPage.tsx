import React from 'react';
import CategoryPage from '../components/products/CategoryPage';

const TobaccoPage: React.FC = () => {
  return (
    <CategoryPage 
      categorySlug="tobacco"
      categoryName="Tobacco"
      categoryDescription="Discover our premium tobacco blends for your hookah. From refreshing mint to exotic fruit combinations, we offer a wide range of flavors to enhance your smoking experience."
      bannerImage="/images/category-tobacco.jpg"
    />
  );
};

export default TobaccoPage;
