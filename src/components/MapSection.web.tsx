import React from "react";
import { View } from "react-native";

interface Props {
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}

export default function MapSection(_props: Props) {
  // Web build: render an empty placeholder to avoid native modules
  return <View style={{ height: "35%" }} />;
}
