import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AppNavigator from "./src/navigation/AppNavigator";

const Stack = createStackNavigator();

const App = () => {
  return (
    
     <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>

    );
 }; 

export default App;
