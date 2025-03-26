import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const SearchBar = () => {
  return (
    <View style={styles.searchContainer}>
      <TextInput placeholder="All Categories" style={styles.dropdown} />
      <TextInput placeholder="Enter Product" style={styles.input} />
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
  },
  dropdown: {
    flex: 0.4,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    paddingRight: 10,
  },
  input: {
    flex: 0.6,
    paddingLeft: 10,
  },
});

export default SearchBar;
