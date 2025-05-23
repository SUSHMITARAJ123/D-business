import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
//import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "../screens/SplashScreen"
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OtpVerificationScreen from "../screens/otpScreens/OtpVerificationScreen";
import SuccessScreen from "../screens/SuccessScreen";
import SignInOtpVerification from "../screens/otpScreens/SignInOtpVerification";
import ResetPassword from "../screens/ResetPassword";
import DashboardScreen from "../screens/DashboardScreen";
import CreateTenderScreen from "../screens/CreateTenderScreen";
import TenderDetailsScreen from "../screens/TenderDetailsScreen";
import OngoingTenderScreen from "../screens/OngoingTenderScreen";
import CompletedTenderScreen from "../screens/CompletedTenderScreen";
import PendingTenderScreen from "../screens/PendingTenderScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} /> 
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="SignInOtpVerification" component={SignInOtpVerification} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="CreateTender" component={CreateTenderScreen} />
      <Stack.Screen name="TenderDetails" component={TenderDetailsScreen} />
      <Stack.Screen name="OngoingTenderScreen" component={OngoingTenderScreen} />
      <Stack.Screen name="CompletedTenderScreen" component={CompletedTenderScreen} />
      <Stack.Screen name="PendingTenderScreen" component={PendingTenderScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
