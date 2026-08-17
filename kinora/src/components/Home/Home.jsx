import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import TraditionalCategoriesSection from "./TraditionalCategoriesSection";
import FeaturedProducts from "./FeaturedProducts";
import ValueSection from "./ValueSection";
import Footer from "./Footer";
import "./Home.css";
const Home = () => {
  return (
    <>
      <main>
        <HeroSection />
        <CategoriesSection />
        <TraditionalCategoriesSection />
        <FeaturedProducts />
        <ValueSection />
      </main>
      <Footer />
    </>
  );
};
export default Home;
