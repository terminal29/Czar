import * as React from "react";
import { Text, StyleSheet, View } from "react-native";
import { useState, ReactNode, useEffect } from "react";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  verticalPanGestureHandler,
  snapPoint,
  approximates,
  ReText
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { StyleProvider } from "../data/StyleProvider";

const {
  Value,
  Clock,
  block,
  cond,
  eq,
  set,
  add,
  startClock,
  decay,
  and,
  lessOrEq,
  greaterOrEq,
  multiply,
  not,
  SpringUtils,
  spring,
  sub,
  pow,
  diff,
  min,
  divide,
  abs,
  useCode,
  neq,
  call,
  concat
} = Animated;

interface PullableScrollViewProps {
  contentContainerStyle?: any;
  outerContainerStyle?: any;
  children?: ReactNode;
  scrollTranslateY: Animated.Value<number>;
  threshold: number;
  onPull: () => void;
  willPull: () => void;
}

interface WithScrollParams {
  translationY: Animated.Value<number>;
  velocityY: Animated.Value<number>;
  state: Animated.Value<State>;
  containerHeight: number;
  contentHeight: number;
  isSpringing: Animated.Value<number>;
}

const withScroll = ({
  translationY,
  velocityY,
  state: gestureState,
  containerHeight,
  contentHeight
}: WithScrollParams) => {
  const clock = new Clock();
  const delta = new Value(0);
  const isSpringing = new Value(0);
  const state = {
    time: new Value(0),
    position: new Value(0),
    velocity: new Value(0),
    finished: new Value(0)
  };
  const config = {
    ...SpringUtils.makeDefaultConfig(),

    mass: 10,
    damping: 1000,
    stiffness: 2000
  };

  const upperBound = 0;
  const lowerBound =
    contentHeight > containerHeight ? -(contentHeight - containerHeight) : 0;

  const isInBounds = and(
    lessOrEq(state.position, upperBound),
    greaterOrEq(state.position, lowerBound)
  );

  const overscroll = sub(
    state.position,
    cond(greaterOrEq(state.position, 0), upperBound, lowerBound)
  );

  const friction = (ratio: Animated.Node<number>) =>
    multiply(0.52, pow(sub(1, ratio), 2));

  return block([
    startClock(clock),
    set(delta, diff(translationY)),
    cond(
      eq(gestureState, State.ACTIVE),
      [
        set(isSpringing, 0),
        set(
          state.position,
          add(
            state.position,
            cond(
              isInBounds,
              delta,
              multiply(
                delta,
                friction(min(divide(abs(overscroll), containerHeight), 1))
              )
            )
          )
        ),
        set(state.velocity, velocityY),
        set(state.time, 0)
      ],
      [
        set(translationY, 0),
        cond(
          and(isInBounds, not(isSpringing)),
          [decay(clock, state, { deceleration: 0.997 })],
          [
            set(isSpringing, 1),
            set(
              config.toValue,
              snapPoint(state.position, state.velocity, [
                lowerBound,
                upperBound
              ])
            ),
            spring(clock, state, config)
          ]
        )
      ]
    ),
    state.position
  ]);
};

const PullableScrollView = (props: PullableScrollViewProps) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const { gestureHandler, translationY, velocityY, state } = useMemoOne(
    () => verticalPanGestureHandler(),
    []
  );
  const translateY = new Animated.Value(0);
  const isPulling = new Animated.Value(0);
  const wasPulling = new Animated.Value(0);
  const isSpringing = new Animated.Value(0);
  const hasTriggeredWillPull = new Animated.Value(0);
  useCode(
    () =>
      block([
        set(
          translateY,
          withScroll({
            translationY,
            velocityY,
            state,
            containerHeight,
            contentHeight,
            isSpringing
          })
        ),
        set(isPulling, cond(eq(state, State.ACTIVE), 1, 0)),
        cond(
          and(
            greaterOrEq(translateY, props.threshold),
            eq(wasPulling, 1),
            eq(hasTriggeredWillPull, 0)
          ),
          block([call([], props.willPull), set(hasTriggeredWillPull, 1)])
        ),
        cond(
          and(
            greaterOrEq(translateY, props.threshold),
            eq(wasPulling, 1),
            eq(isPulling, 0)
          ),
          block([call([], props.onPull), set(hasTriggeredWillPull, 0)])
        ),
        set(wasPulling, isPulling)
      ]),
    [containerHeight, contentHeight, props.threshold, props.onPull]
  );

  return (
    <View
      style={[styles.container, props.outerContainerStyle]}
      onLayout={({
        nativeEvent: {
          layout: { height }
        }
      }) => setContainerHeight(height)}
    >
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          onLayout={({
            nativeEvent: {
              layout: { height }
            }
          }) => setContentHeight(height)}
          style={[props.contentContainerStyle, { transform: [{ translateY }] }]}
        >
          {props.children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default PullableScrollView;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" }
});
