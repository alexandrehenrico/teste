import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigationApp from './stack';
import { SafeAreaView } from "react-native";

export default function RoutesContainer() {
    return (
    <SafeAreaView style={{flex: 1}}>
        <NavigationContainer>
            <StackNavigationApp />
        </NavigationContainer>
    </SafeAreaView>
    )
}