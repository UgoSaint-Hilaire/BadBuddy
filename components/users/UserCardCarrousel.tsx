import { View, useWindowDimensions } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { User } from "@/app/types/user";
import UserCard from "./UserCard";

interface UserCardCarouselProps {
  data: User[];
  onActiveIndexChange?: (index: number) => void;
}

export const UserCardCarousel: React.FC<UserCardCarouselProps> = ({ data, onActiveIndexChange }) => {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const { width } = useWindowDimensions();
  const CARD_SPACING = 12;
  const SIZE = width * 0.6;
  const SPACER = (width - SIZE) / 2;
  const x = useSharedValue(0);

  const handleIndexChange = (index: number) => {
    onActiveIndexChange?.(index);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
      const slideSize = SIZE + CARD_SPACING * 2;
      const activeIndex = Math.round(event.contentOffset.x / slideSize);
      if (onActiveIndexChange) {
        runOnJS(handleIndexChange)(activeIndex);
      }
    },
  });

  return (
    <View>
      <Animated.ScrollView
        pagingEnabled
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SIZE + CARD_SPACING * 2}
        horizontal
        bounces={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACER,
        }}
      >
        {data.map((item, index) => (
          <View
            key={item.id}
            style={{
              marginHorizontal: CARD_SPACING,
            }}
          >
            <UserCard item={item} size={SIZE} x={x} index={index} />
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};
