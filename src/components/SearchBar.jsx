import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const categories = [
  { label: "Clothing Store", value: "clothing_store" },
];

const productsByCategory = {
  clothing_store: [
    { label: "Mens Wear", value: "mens_wear" },
    { label: "Womens Wear", value: "womens_wear" },
    { label: "Kids Wear", value: "kids_wear" },
    { label: "Formal Wear", value: "formal_wear" },
  ],
};

const SearchBar = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <View style={styles.searchContainer}>
      {/* Category Dropdown */}
      <Dropdown
        data={categories}
        labelField="label"
        valueField="value"
        placeholder="Select Category"
        value={selectedCategory}
        onChange={(item) => {
          setSelectedCategory(item.value);
          setSelectedProduct(null); 
        }}
        style={styles.dropdown}
      />

      {/* Product Dropdown (Dynamic based on selected category) */}
      <Dropdown
        data={selectedCategory ? productsByCategory[selectedCategory] || [] : []}
        labelField="label"
        valueField="value"
        placeholder="Select Product"
        value={selectedProduct}
        onChange={(item) => setSelectedProduct(item.value)}
        style={styles.dropdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
    alignItems: "center",
  },
  dropdown: {
    flex: 0.5,
    marginHorizontal: 5,
  },
});

export default SearchBar;
