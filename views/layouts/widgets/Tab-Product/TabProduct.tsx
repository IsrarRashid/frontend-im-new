import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { TabContent, TabPane, Row, Col, Carousel, CarouselItem } from "reactstrap";
import ProductBox from "../Product-Box/productbox";
import Slider from "react-slick";
import { WishlistContext } from "../../../../helpers/wishlist/wish.context";
import { CompareContext } from "../../../../helpers/compare/compare.context";
import { Skeleton } from "../../../../common/skeleton";
import { useApiData } from "helpers/data/DataContext"; // Make sure to provide the correct path

var settings = {
  arrows: true,
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 6,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1700,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 5,
        infinite: true,
      },
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
      },
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
  ],
};

type TabProductProps = {
  catId: number;
  effect?: any;
};

interface ApiData {
  menus: {
    [menuKey: string]: {
      categories: {
        id: any;
        name: string;
        sub_categories: {
          id: any;
          name: string;
          products: any[]; // Define the actual product type
        }[];
      }[];
    };
  };
}


const TabProduct: NextPage<TabProductProps> = ({ catId, effect }) => {
  const { addToWish } = React.useContext(WishlistContext);
  const { addToCompare } = React.useContext(CompareContext);
  const [activeTab, setActiveTab] = useState("new products");
  const [categoryName, setCategoryName] = useState('');
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiData = useApiData() as ApiData;

  useEffect(() => {
    if (apiData?.menus) {
      for (let menuKey in apiData.menus) {
        let category = apiData.menus[menuKey].categories.find((cat) => cat.id === catId);
  
        if (category) {
          setSubCategoriesData(category.sub_categories);
          setCategoryName(category.name); // Set the category name when found
  
          // Check if the category has subcategories
          if (category.sub_categories.length > 0) {
            setActiveTab(category.sub_categories[0].id); // Set the active sub-category to the first one
          }
          break; // Break out of the loop once we found the category
        }
      }
    }
  }, [catId, apiData]);
  

  // Use this effect to update the productsData when the activeTab changes
  useEffect(() => {
    if (activeTab) {
      const activeSubCategory = subCategoriesData.find((subCategory) => subCategory.id === activeTab);
      if (activeSubCategory) {
        setProductsData(activeSubCategory.products);
        setLoading(false);
      }
    }
  }, [activeTab, subCategoriesData]);

  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    // Find the index of the currently active tab
    const currentIndex = subCategoriesData.findIndex((subCategory) => subCategory.id === activeTab);

    // If on the 7th category (index 6) and there's an 8th category, just move to the next category (8th)
    if (currentIndex === 6 && subCategoriesData.length > 7) {
      setActiveTab(subCategoriesData[9].id); // Directly set to the 8th category
      setActiveIndex(1); // Move the carousel to show the next set of categories
    } else {
      const nextIndex = (currentIndex + 1) % subCategoriesData.length;
      setActiveTab(subCategoriesData[nextIndex].id);

      // Check if the carousel needs to be moved to display the newly active category
      const visibleCategories = currentIndex % 7; // Check which set of 7 categories we are viewing
      if (visibleCategories === 6) {
        setActiveIndex((activeIndex + 1) % Math.ceil(subCategoriesData.length / 7));
      }
    }
    setLoading(true);
  };

  const previous = () => {
    // Find the index of the currently active tab
    const currentIndex = subCategoriesData.findIndex((subCategory) => subCategory.id === activeTab);

    // If on the 1st category of the next slide (e.g., the 8th category if each slide displays 7 categories)
    if (currentIndex % 7 === 0 && currentIndex !== 0) {
      setActiveTab(subCategoriesData[currentIndex - 1].id); // Directly move to the previous category (e.g., 7th)
      setActiveIndex(activeIndex - 1); // Move the carousel to show the previous set of categories
    } else {
      // Calculate the index of the previous tab (cyclically)
      const previousIndex = (currentIndex - 1 + subCategoriesData.length) % subCategoriesData.length;
      setActiveTab(subCategoriesData[previousIndex].id);

      // Check if the carousel needs to be moved to display the newly active category
      const visibleCategories = (currentIndex - 1) % 7; // Check which set of 7 categories we are viewing
      if (visibleCategories === 6) {
        setActiveIndex((activeIndex - 1 + Math.ceil(subCategoriesData.length / 7)) % Math.ceil(subCategoriesData.length / 7));
      }
    }
    setLoading(true);
  };

  return (
    <>
      <section className="section-pt-space bg-white mt-2">
        <div className="custom-container ">
          <div className="tab-product-main">
            <div className="tab-prodcut-contain">
              <div className="category-title">
                <h3>{categoryName.substring(0, 15)}{categoryName.length > 15 ? "..." : ""}</h3>
              </div>

              <div className="top-bar-product-catogories">
                <Carousel activeIndex={activeIndex} next={next} previous={previous} interval={false}>
                  {subCategoriesData.map((subCategory, i) => (
                    <CarouselItem key={subCategory.id}>
                      <ul className="product-catogories">
                        {subCategoriesData.slice(i, i + 9).map((subCategory) => (
                          <li className="top-catogories">
                            <a
                              className={activeTab === subCategory.id ? "active" : ""}
                              onClick={() => {
                                setLoading(true);
                                setActiveTab(subCategory.id);
                              }}
                            >
                              {subCategory.name.substring(0, 12)}
                              {subCategory.name.length > 12 ? "..." : ""}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CarouselItem>
                  ))}
                </Carousel>
              </div>
              <div className="view-all d-flex " style={{ marginLeft: "auto" }}>
                <div className="px-2 arrows">
                  <ul className="catogories-arrows">
                    <li>
                      <a className="prev" onClick={previous}>
                        <i className="fa fa-angle-left"></i>
                      </a>
                    </li>
                    <li>
                      <a className="next" onClick={next}>
                        <i className="fa fa-angle-right"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="view-akk">
                  <a href="/collections/leftsidebar">View all</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py-space ratio_asos product">
        <div className="custom-container">
          <Row>
            <Col className="pe-0">
              <TabContent activeTab={activeTab}>
                <TabPane tabId={activeTab}>
                  <div className="product product-slide-6 product-m no-arrow">
                    <div>
                      {loading ? (
                        <Skeleton />
                      ) : (
                        <Slider {...settings}>
                          {productsData.map((product, i) => (
                            <div key={i}>
                              <ProductBox
                                hoverEffect={effect}
                                product={product} // Pass the product data
                               // Example: pass the product and quantity
                                addCompare={(product) => addToCompare(product)}
                                addWish={(product) => addToWish(product)}
                              />
                            </div>
                          ))}
                        </Slider>
                      )}
                    </div>
                  </div>
                </TabPane>
              </TabContent>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default TabProduct;
